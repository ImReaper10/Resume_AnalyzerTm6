# Authentication and API Setup Guide

## How to Set Up Authentication

1. **Get the Public Key:**
   - Make a `GET` request to `/api/public-key` to obtain a `public key` and `keypairId` (details below).
2. **Add Authorization Header:**
   - For endpoints requiring authorization, include the following header:
     ```
     {
       Authorization: "<keypairId> <encrypted_jwt>"
     }
     ```
     - Replace `<keypairId>` with the `keypairId` obtained from the public key.
     - Replace `<encrypted_jwt>` with the encrypted JWT.
3. **Verify Authorization:**
   - Your requests should now be authorized!

---

## API Endpoints

### **GET /api/public-key**
**Purpose:** Obtain a public key to encrypt data before sending it to the backend. Each public key can only be used once.

- **Request:** No data required.
- **Response:**
  ```json
  {
    "key": "public key",
    "keypairId": "ID for the public key"
  }
  ```

### **POST /api/register**
**Purpose:** Register an account. Passwords must:
  - Be at least 8 characters long.
  - Include an uppercase letter, a lowercase letter, a number, and a special character.
  - Be encrypted using a public key from `/api/public-key`.

- **Request:**
  ```json
  {
    "email": "email",
    "password": "encrypted string",
    "username": "username",
    "keypairId": "ID of public key used for password encryption"
  }
  ```
- **Response:**
  Success:
  ```json
  {
    "message": "User registered"
  }
  ```
  Error:
  ```json
  {
    "error": "There was an error registering: ..."
  }
  ```

### **POST /api/login**
**Purpose:** Log in to an account. Password must be encrypted using a public key, and another public key must be used to encrypt the JWT.

- **Request:**
  ```json
  {
    "email": "email",
    "password": "encrypted string",
    "keypairId": "ID of public key used for password encryption",
    "keyForJWT": "encrypted key for JWT"
  }
  ```
- **Response:**
  Success:
  ```json
  {
    "token": "encrypted token"
  }
  ```
  Error:
  ```json
  {
    "error": "Error during login: ..."
  }
  ```

### **GET /api/account**
**Purpose:** Retrieve account information (username and email). Requires authorization.

- **Request:** No data required.
- **Response:**
  Success:
  ```json
  {
    "email": "email",
    "username": "username"
  }
  ```
  Error:
  ```json
  {
    "error": "An error occurred: ..."
  }
  ```

### **POST /api/resume-upload**
**Purpose:** Upload a resume file. File must be a `.pdf` or `.docx`, less than 2MB, and under 5000 characters. Requires authorization.

- **Request:** Form data with `resume_file` attached.
- **Response:**
  ```json
  {
    "message": "Resume uploaded and text extracted successfully.",
    "status": "success"
  }
  ```

### **POST /api/job-description**
**Purpose:** Submit a job description. The description must be less than 5000 characters. Requires authorization.

- **Request:**
  ```json
  {
    "job_description": "job description"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Job description submitted and stored successfully.",
    "status": "success"
  }
  ```

### **POST /api/fit-score**
**Purpose:** Analyze the fit score based on the uploaded resume and job description. Requires authorization.

- **Request:** No data required.
- **Response:**
  ```json
  {
    "fitScore": "Number between 0-100",
    "improvementSuggestions": [
      {
        "category": "category (skills, experience, or formatting)",
        "text": "suggestion"
      }
    ],
    "keywordsInJobDescription": ["keyword1", "keyword2"],
    "matchedKeywordsInResume": ["keyword1", "keyword2"],
    "status": "success"
  }
  ```

### **POST /api/analyze**
**Purpose:** Used by the backend to call the OpenAI API for analysis. Requires a public key for encrypting the analysis secret.

- **Request:**
  ```json
  {
    "resume_text": "Raw text from resume",
    "job_description": "job description",
    "analysis_secret": "Encrypted secret key",
    "keypairId": "Key pair ID used to encrypt the analysis secret"
  }
  ```
- **Response:**
  ```json
  {
    "fitScore": "Number between 0-100",
    "improvementSuggestions": [
      {
        "category": "category (skills, experience, or formatting)",
        "text": "suggestion"
      }
    ],
    "keywordsInJobDescription": ["keyword1", "keyword2"],
    "matchedKeywordsInResume": ["keyword1", "keyword2"],
    "status": "success"
  }
  ```

### **GET /api/currently-uploaded-data**
**Purpose:** Retrieve uploaded data for the account. Returns an empty object if no data is uploaded. Requires authorization.

- **Request:** No data required.
- **Response:**
  With data:
  ```json
  {
    "data": {
      "resumeText": "raw resume text",
      "jobDescription": "job description",
      "uploadTime": "time in milliseconds"
    }
  }
  ```
  Without data:
  ```json
  {
    "data": {}
  }
  ```

### **DELETE /api/currently-uploaded-data**
**Purpose:** Delete uploaded data, if it exists. Requires authorization.

- **Request:** No data required.
- **Response:**
  With data:
  ```json
  {
    "message": "Data deleted"
  }
  ```
  Without data:
  ```json
  {
    "message": "No data to delete"
  }
  ```

### **GET /api/status**
**Purpose:** Retrieve the status of the backend.

- **Request:** No data required.
- **Response:**
  ```json
  {
    "message": "Up and running!"
  }
  ```
