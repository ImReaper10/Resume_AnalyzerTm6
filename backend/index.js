const fs = require("fs");
const path = require("path");
const express = require("express");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_FILE_PATH = path.join(__dirname, 'jwt_secret.key');

function getJWTSecret() {
    if (fs.existsSync(SECRET_FILE_PATH)) {
        return fs.readFileSync(SECRET_FILE_PATH, 'utf8');
    } else {
        const newSecret = crypto.randomBytes(64).toString('hex');
        fs.writeFileSync(SECRET_FILE_PATH, newSecret, 'utf8');
        console.log('JWT secret generated and saved to file.');
        return newSecret;
    }
}

const JWT_SECRET = getJWTSecret();
const JWT_EXPIRATION = '1h';

let privateKey, publicKey;

// For more security in the future we could possibly have a unique key pair for each connection, but realistically this should be fine
crypto.generateKeyPair('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
}, (err, pubKey, privKey) => {
    if (err) {
        console.error('Error generating key pair:', err);
        process.exit(1);
    }
    publicKey = pubKey;
    privateKey = privKey;
    console.log('Key pair generated successfully');
});

const users = [];

function registerUser(email, username, hashedPassword) {
    users.push({ email, username, password: hashedPassword });
}

function loginUser(email, plainPassword) {
    const user = users.find(user => user.email === email);
    if (!user) {
        return null;
    }

    const hashedPassword = crypto.pbkdf2Sync(plainPassword, user.password.salt, 1000, 64, 'sha512').toString('hex');
    if (hashedPassword !== user.password.hashedPassword) {
        return null;
    }

    return user;
}

function checkForUser(email, username) {
    return users.some(user => user.email === email || user.username === username);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function decrypt(data) { // Data is an encrypted base64 string
    const encryptedData = Buffer.from(data, 'base64');
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        encryptedData
    );
    return decryptedData.toString('utf8');
}

app.get('/api/public-key', (req, res) => {
    res.send(publicKey);
});

app.post('/api/register', (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: "Missing email, username, or password" });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (checkForUser(email, username)) {
            return res.status(400).json({ error: "Email or username already exists" });
        }
        let plainPassword;
        try {
            console.log(password)
            plainPassword = decrypt(password);
            console.log(plainPassword)
        } catch (err) {
            return res.status(400).json({ error: "Invalid encrypted password" });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');

        registerUser(email, username, { hashedPassword, salt });
        res.status(201).json({ message: "User registered" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "There was an error registering: " + err.message });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    let plainPassword;
    try {
        plainPassword = decrypt(password);
    } catch (err) {
        return res.status(400).json({ error: "Invalid encrypted password" + err.message });
    }

    const user = loginUser(email, plainPassword);
    if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ email: user.email, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    res.status(200).json({ token });
});

app.listen(3000, "localhost", () => {
    console.log("Server started...");
});
