const fs = require("fs");
const path = require("path");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const {
    extractTextFromPdf,
    extractTextFromDocx
} = require("./fileParserUtils");
const {
    getRawMetrics,
    analyze
} = require("./aiUtils");
const app = express();
const cors = require('cors');
const multer = require('multer');
const fileType = require('file-type');
const OpenAI = require("openai");
app.use(express.json());
app.use(cors());

//For managing form files
const upload = multer({
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    storage: multer.memoryStorage(),
});

//=========== Oscar Cotto ===========
//The below is for validating file types from a buffer, mainly checks if a file is a pdf or docx
//Edited by James Goode
const validateFileType = async (fileBuffer) => {
    const type = await fileType.fromBuffer(fileBuffer);
    return {
        valid: type && (type.mime === 'application/pdf' || type.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        mime: type ? type.mime : undefined
    };
};

//Below are the file paths for the database and secret key for JWT
const SECRET_FILE_PATH = path.join(__dirname, "jwt_secret.key");
const SECRET_ANALYSIS_FILE_PATH = path.join(__dirname, "analysis_secret.key");
const DATABASE_FILE_PATH = path.join(__dirname, "users.db");

function getAnalyzeSecret() {
    if (fs.existsSync(SECRET_ANALYSIS_FILE_PATH)) {
        return fs.readFileSync(SECRET_ANALYSIS_FILE_PATH, "utf8");
    } else {
        const newSecret = crypto.randomBytes(64).toString("hex");
        fs.writeFileSync(SECRET_ANALYSIS_FILE_PATH, newSecret, "utf8");
        console.log("Analysis secret generated and saved to file.");
        return newSecret;
    }
}

//Below is for the analyze endpoint
const ANALYSIS_SECRET = getAnalyzeSecret();

//=========== James Goode ===========
//The below creates a JWT Secret if one is not already created, then returns the JWT Secret
function getJWTSecret() {
    if (fs.existsSync(SECRET_FILE_PATH)) {
        return fs.readFileSync(SECRET_FILE_PATH, "utf8");
    } else {
        const newSecret = crypto.randomBytes(64).toString("hex");
        fs.writeFileSync(SECRET_FILE_PATH, newSecret, "utf8");
        console.log("JWT secret generated and saved to file.");
        return newSecret;
    }
}

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRATION = "1h";

//The below is the object that holds all the private keys
let privateKeys = {};

// Set up SQLite database
const db = new sqlite3.Database(DATABASE_FILE_PATH, (err) => {
    if (err) {
        console.error("Error opening SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        db.run(
            `CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL
            )`,
            (err) => {
                if (err) {
                    if (err.message.indexOf("already exists") !== -1) {
                        console.log("Users table found.")
                    } else {
                        console.error("Error creating users table:", err.message);
                    }
                } else {
                    console.log("Users table created.");
                }
            }
        );
    }
});

//=========== James Goode ===========
//The below is for inserting a user into the sql database
function registerUser(email, username, hashedPassword, salt) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (email, username, password_hash, salt) VALUES (?, ?, ?, ?)`;
        db.run(sql, [email, username, hashedPassword, salt], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID); // Return the ID of the new user
        });
    });
}

//=========== James Goode ===========
//The below essentially just finds a user by there email, but is mainly used in the logging in process
function loginUser(email) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.get(sql, [email], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

//=========== James Goode ===========
//Checks for the existence of a user in the database
function checkForUser(email, username) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT 1 FROM users WHERE email = ? OR username = ?`;
        db.get(sql, [email, username], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(!!row); // Return true if a user exists, false otherwise
        });
    });
}

//=========== James Goode ===========
//Finds a user in the database by there id
function getUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

//=========== James Goode ===========
//Util for checking if an email is valid
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//=========== James Goode ===========
//Decrypts data by finding the right key
function decrypt(data, keypairId) {
    const privKey = privateKeys[keypairId];
    if (!privKey) {
        throw Error("Invalid keypairId");
    }
    delete privateKeys[keypairId];
    const encryptedData = Buffer.from(data, "base64");
    const decryptedData = crypto.privateDecrypt({
            key: privKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        encryptedData
    );
    return decryptedData.toString("utf8");
}

//=========== James Goode ===========
//Creates and sends a public key back
app.get("/api/public-key", (req, res) => {
    crypto.generateKeyPair(
        "rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
            },
        },
        (err, pubKey, privKey) => {
            if (err) {
                console.error("Error generating key pair:", err);
                res.status(400).json({
                    error: "Error generating key"
                });
                return;
            }
            let keypairId = crypto.randomBytes(32).toString("hex");
            privateKeys[keypairId] = privKey;
            res.send({
                key: pubKey,
                keypairId
            });
        }
    );
});



//=========== James Goode ===========
//API for registering a user, also does necessary checks
app.post("/api/register", async (req, res) => {
    try {
        const {
            email,
            password,
            username,
            keypairId
        } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({
                error: "Missing email, username, or password"
            });
        }
        if (!keypairId) {
            return res.status(400).json({
                error: "Missing keypairId"
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Invalid email format"
            });
        }
        if (await checkForUser(email, username)) {
            return res.status(400).json({
                error: "Email or username already exists"
            });
        }
        let plainPassword;
        try {
            plainPassword = decrypt(password, keypairId);
        } catch (err) {
            return res.status(400).json({
                error: "Invalid encrypted password"
            });
        }

        let passcheck = checkSecurePassword(plainPassword);

        if (!passcheck.valid) {
            return res.status(400).json({
                error: passcheck.message
            });
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto
            .pbkdf2Sync(plainPassword, salt, 1000, 64, "sha512")
            .toString("hex");

        await registerUser(email, username, hashedPassword, salt);
        res.status(201).json({
            message: "User registered"
        });
    } catch (err) {
        //console.error(err);
        res.status(500).json({
            error: "There was an error registering: " + err.message
        });
    }
});

//=========== James Goode ===========
//Endpoint for logging in and getting JWT
app.post("/api/login", async (req, res) => {
    const {
        email,
        password,
        keypairId,
        keyForJWT
    } = req.body;

    if (!keypairId) {
        return res.status(400).json({
            error: "Missing keypairId"
        });
    }

    if (!email || !password) {
        return res.status(400).json({
            error: "Missing email or password"
        });
    }

    let plainPassword;
    try {
        plainPassword = decrypt(password, keypairId);
    } catch (err) {
        return res.status(400).json({
            error: "Invalid encrypted password: " + err.message
        });
    }

    try {
        const user = await loginUser(email);
        if (!user) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        const hashedPassword = crypto
            .pbkdf2Sync(plainPassword, user.salt, 1000, 64, "sha512")
            .toString("hex");
        if (hashedPassword !== user.password_hash) {
            return res.status(400).json({
                error: "Invalid email or password"
            });
        }

        //console.log(user);

        const token = jwt.sign({
                id: user.id
            },
            JWT_SECRET, {
                expiresIn: JWT_EXPIRATION
            }
        );

        let encryptedToken = crypto.publicEncrypt({
                key: keyForJWT,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            token
        ).toString('base64');

        res.status(200).json({
            token: encryptedToken
        });
    } catch (err) {
        //console.error(err);
        res.status(500).json({
            error: "Error during login: " + err.message
        });
    }
});

//=========== James Goode ===========
//Returns basic account information
app.get("/api/account", authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT email, username FROM users WHERE email = ?`;
        db.get(sql, [req.user.email], (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: "Database error: " + err.message
                });
            }
            if (!user) {
                return res.status(404).json({
                    error: "User not found."
                });
            }
            res.status(200).json(user);
        });
    } catch (err) {
        res.status(500).json({
            error: "An error occurred: " + err.message
        });
    }
});

//=========== James Goode ===========
//Gets uploaded data that is currently saved
app.get("/api/currently-uploaded-data", authenticateToken, async (req, res) => {
    let current_data = temp_storage[req.user.email];
    if (current_data) {
        res.status(200).json({
            data: current_data
        });
    } else {
        res.status(200).json({
            data: {}
        }); //For now I am making it send an empty object, but we may end up wanting different behavior
    }
});

//=========== James Goode ===========
//Endpoint for deleting currently uploaded data
app.delete("/api/currently-uploaded-data", authenticateToken, async (req, res) => {
    let current_data = temp_storage[req.user.email];
    if (current_data) {
        delete temp_storage[req.user.email];
        res.status(200).json({
            message: "Data deleted"
        });
    } else {
        res.status(200).json({
            message: "No data to delete"
        });
    }
});

//This is for the PDF text and job descriptions
const temp_storage = {};

//Every minute check temp storage and remove older than 30 minute entries
setInterval(() => {
    let currentTime = Date.now();
    for (let item of Object.keys(temp_storage)) {
        if (currentTime - temp_storage[item].uploadTime > 1800000) {
            delete temp_storage[item]
        }
    }
}, 60000);

//=========== Oscar Cotto and Javin Kenta (for storage assistance) ===========
//The below is the endpoint for uploading resumes, makes sure that the file uploaded is a pdf or docx, if it is less than 2mb, and stores it for later use
//Edited by James Goode
app.post('/api/resume-upload', authenticateToken, upload.single('resume_file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                error: 'No file uploaded.',
                status: 'error',
            });
        }

        if (file.size > 2 * 1024 * 1024) {
            return res.status(400).json({
                error: 'File size exceeds the limit of 2MB.',
                status: 'error',
            });
        }

        const isValidFileType = await validateFileType(file.buffer);
        if (!isValidFileType.valid) {
            return res.status(400).json({
                error: 'Invalid file type. Only PDF or DOCX files are allowed.',
                status: 'error',
            });
        }

        let extractedText = "";
        if (isValidFileType.mime === "application/pdf") {
            extractedText = await extractTextFromPdf(file.buffer);
        } else {
            extractedText = await extractTextFromDocx(file.buffer);
        }

        if(extractedText.length > 5000)
        {
            return res.status(400).json({
                error: 'File content is too large (more than 5000 characters extracted).',
                status: 'error',
            });
        }

        // Store extracted resume text associated with the user
        if (!temp_storage[req.user.email]) {
            temp_storage[req.user.email] = {};
        }
        temp_storage[req.user.email].resumeText = extractedText;
        temp_storage[req.user.email].uploadTime = Date.now();

        res.status(200).json({
            message: 'Resume uploaded and text extracted successfully.',
            status: 'success',
        });
    } catch (error) {
        //console.error('Error processing resume upload:', error);
        res.status(500).json({
            error: 'An error occurred while processing the file.',
            status: 'error',
        });
    }
});

//=========== Oscar Cotto ===========
//Global error handler for Multer file size errors
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File size exceeds the limit of 2MB.',
            status: 'error',
        });
    }
    next(err);
});

//=========== Oscar Cotto and Javin Kenta (for storage assistance) ===========
//The below is the endpoint for uploading job descriptions, makes sure that the job description is less than or equal to 5000 characters, and stores it for later use
//Edited by James Goode
app.post('/api/job-description', authenticateToken, (req, res) => {
    try
    {
        const {
            job_description
        } = req.body;

        if (!job_description || job_description.length > 5000) {
            return res.status(400).json({
                error: 'Job description exceeds character limit.',
                status: 'error',
            });
        }

        // Clean the job description by removing extraneous whitespace
        const cleanedDescription = job_description.trim();

        // Store the job description associated with the user
        if (!temp_storage[req.user.email]) {
            temp_storage[req.user.email] = {};
        }
        temp_storage[req.user.email].jobDescription = cleanedDescription;
        temp_storage[req.user.email].uploadTime = Date.now();

        res.status(200).json({
            message: 'Job description submitted and stored successfully.',
            status: 'success',
        });
    }
    catch(e)
    {
        res.status(500).json({error: e.message});
    }
});

app.post('/api/fit-score', authenticateToken, async (req, res) => {
    try
    {
        const {
            mock
        } = req.body;

        let data = temp_storage[req.user.email];

        if(!data || !data.jobDescription || data.jobDescription.length == 0 || !data.resumeText || data.resumeText.length == 0)
        {
            res.status(500).json({error: "Data not uploaded"});
            return;
        }

        let metrics = await analyze(data.jobDescription, data.resumeText, mock);

        res.status(200).json({
            ... metrics,
            status: 'success',
        });
    }
    catch(e)
    {
        res.status(500).json({error: e.message});
    }
});

//=========== James Goode ===========
//Endpoint for calling OpenAI API for analysis, and sending back raw data
app.post('/api/analyze', async (req, res) => {
    try
    {
        const {
            resume_text,
            job_description,
            analysis_secret,
            keypairId,
            mock
        } = req.body;

        if (!analysis_secret) {
            return res.status(400).json({
                error: "Missing analysis_secret"
            });
        }

        if (!keypairId) {
            return res.status(400).json({
                error: "Missing keypairId"
            });
        }

        if(decrypt(analysis_secret, keypairId) !== ANALYSIS_SECRET)
        {
            return res.status(400).json({
                error: "Analysis secret did not match"
            });
        }

        if (!job_description || job_description.length > 10000) {
            return res.status(400).json({
                error: 'Invalid job_description',
                status: 'error',
            });
        }

        if (!resume_text || resume_text.length > 10000) {
            return res.status(400).json({
                error: 'Invalid resume_text',
                status: 'error',
            });
        }

        let rawMetrics = undefined;

        if(mock)
        {
            rawMetrics = {"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]};
        }
        else
        {
            rawMetrics = await getRawMetrics(job_description, resume_text);
        }

        //TODO possibly handle API failure here

        res.status(200).json({
            ... rawMetrics,
            status: 'success',
        });
    }
    catch(e)
    {
        res.status(500).json({error: e.message});
    }
});

//=========== James Goode ===========
//Endpoint for mainly checking if the backend is running
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: "Up and running!"
    });
});

//Starts the server
app.listen(5000, "localhost", () => {
    console.log("Server started...");
});

//=========== James Goode ===========
//Middleware for authentication
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const tokenEnc = authHeader && authHeader.split(" ");
        const token = decrypt(tokenEnc[2], tokenEnc[1]);
        if (!token) {
            return res.status(401).json({
                error: "Access denied. No token provided."
            });
        }

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).json({
                    error: "Invalid or expired token."
                });
            }
            req.user = await getUserById(user.id);
            //console.log(req.user);
            next();
        });
    } catch (err) {
        return res.status(400).json({
            error: "There was an error while authenticating: " + err.message
        });
    }
}

//=========== James Goode ===========
//Util for checking if a password is secure or not
function checkSecurePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
        return {
            valid: false,
            message: "Password must be at least 8 characters long."
        };
    }
    if (!hasUppercase.test(password)) {
        return {
            valid: false,
            message: "Password must include at least one uppercase letter."
        };
    }
    if (!hasLowercase.test(password)) {
        return {
            valid: false,
            message: "Password must include at least one lowercase letter."
        };
    }
    if (!hasNumber.test(password)) {
        return {
            valid: false,
            message: "Password must include at least one number."
        };
    }
    if (!hasSpecialChar.test(password)) {
        return {
            valid: false,
            message: "Password must include at least one special character."
        };
    }

    return {
        valid: true,
        message: "Password is secure."
    };
}