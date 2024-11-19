const fs = require("fs");
const path = require("path");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const app = express();
app.use(express.json());

const SECRET_FILE_PATH = path.join(__dirname, "jwt_secret.key");
const DATABASE_FILE_PATH = path.join(__dirname, "users.db"); 

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

let privateKey, publicKey;

// Generate RSA key pair
crypto.generateKeyPair(
    "rsa",
    {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    },
    (err, pubKey, privKey) => {
        if (err) {
            console.error("Error generating key pair:", err);
            process.exit(1);
        }
        publicKey = pubKey;
        privateKey = privKey;
        console.log("Key pair generated successfully");
    }
);

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
                    if(err.message.indexOf("already exists") !== -1)
                    {
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

function registerUser(email, username, hashedPassword, salt) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (email, username, password_hash, salt) VALUES (?, ?, ?, ?)`;
        db.run(sql, [email, username, hashedPassword, salt], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID); // Return the ID of the new user
        });
    });
}

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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function decrypt(data) {
    const encryptedData = Buffer.from(data, "base64");
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        encryptedData
    );
    return decryptedData.toString("utf8");
}

app.get("/api/public-key", (req, res) => {
    res.send(publicKey);
});

app.post("/api/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: "Missing email, username, or password" });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (await checkForUser(email, username)) {
            return res.status(400).json({ error: "Email or username already exists" });
        }
        let plainPassword;
        try {
            plainPassword = decrypt(password);
        } catch (err) {
            return res.status(400).json({ error: "Invalid encrypted password" });
        }
        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto
            .pbkdf2Sync(plainPassword, salt, 1000, 64, "sha512")
            .toString("hex");

        await registerUser(email, username, hashedPassword, salt);
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "There was an error registering: " + err.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    let plainPassword;
    try {
        plainPassword = decrypt(password);
    } catch (err) {
        return res.status(400).json({ error: "Invalid encrypted password: " + err.message });
    }

    try {
        const user = await loginUser(email);
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const hashedPassword = crypto
            .pbkdf2Sync(plainPassword, user.salt, 1000, 64, "sha512")
            .toString("hex");
        if (hashedPassword !== user.password_hash) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error during login: " + err.message });
    }
});

app.get("/api/account", authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT email, username FROM users WHERE email = ?`;
        db.get(sql, [req.user.email], (err, user) => {
            if (err) {
                return res.status(500).json({ error: "Database error: " + err.message });
            }
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }
            res.status(200).json(user);
        });
    } catch (err) {
        res.status(500).json({ error: "An error occurred: " + err.message });
    }
});

app.listen(3000, "localhost", () => {
    console.log("Server started...");
});

function authenticateToken(req, res, next) {
    try
    {
        const authHeader = req.headers["authorization"];
        const tokenEnc = authHeader && authHeader.split(" ")[1];
        const token = decrypt(tokenEnc);
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Invalid or expired token." });
            }
            req.user = user;
            next();
        });
    }
    catch(err)
    {
        return res.status(400).json({ error: "There was an error while authenticating: "  + err.message});
    }
}
