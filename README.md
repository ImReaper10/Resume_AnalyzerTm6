
# AI-Powered Resume Analyzer and Job Matcher (Dream Team) 

## Team Members

| Role            | Name                    | GitHub Username       | Email               |
|------------------|-------------------------|-----------------------|---------------------|
| Project Manager | Husain Awan             | ImReaper10            | hba22@njit.edu      |
| Member          | Diego Velasquez Minaya  | DiegoVelasquezMinaya  | dfv6@njit.edu       |
| Member          | James Goode             | jamesrgoode           | jrg73@njit.edu      |
| Member          | Japjot Bedi             | japjotb               | jsb22@njit.edu      |
| Member          | Javin Kenta             | jav-k-17              | jk636@njit.edu      |
| Member          | Oscar Cotto             | ocotto4               | oc4@njit.edu        |



## Introduction
The AI-Powered Resume Analyzer and Job Matcher is an innovative platform designed to assist users in refining their resumes and aligning them with job market trends. By leveraging advanced Natural Language Processing (NLP) and machine learning, the platform provides actionable feedback for resume improvement and suggests personalized job opportunities.

---

## Description
This platform enables users to:
- Upload resumes as PDFs or text.
- Receive detailed, AI-driven feedback on:
  - Wording and structure improvements.
  - Missing skills or qualifications.
  - Suggestions for aligning their resumes with desired job descriptions.
- Input job descriptions to compare their resumes and receive a "fit score" along with recommendations for bridging skill gaps.

The system is designed to help job seekers optimize their resumes for specific roles and improve their chances of landing their desired jobs.

---

## High-Level Project Overview and Goals

### Project Goals
1. **Resume Analysis**: Provide AI-driven feedback to improve resumes in terms of structure, keywords, and relevance to specific job roles.
2. **Job Matching**: Recommend job listings or career paths based on the analyzed content of a user's resume and skills.
3. **User-Friendly Dashboard**: Create an intuitive and functional interface for users to view feedback, fit scores, and download reports.
4. **Secure and Efficient Processing**: Ensure user data privacy by processing files in memory without persistent storage.

---


## Technical Overview

### Tech Stack
1. **Backend**:
   - **Primary Framework**: FastAPI (Python) or Express/NestJS (Node.js).
   - **Core Features**: File handling, user authentication, NLP integration.
2. **Frontend**:
   - React.js or Vue.js for dynamic and user-friendly interfaces.
3. **NLP and Machine Learning**:
   - Pre-trained NLP models via APIs like OpenAI or Hugging Face.
   - Algorithms to calculate fit scores based on resume and job description content.
4. **Communication**:
   - REST or GraphQL APIs to connect frontend and backend seamlessly.

### Example Input/Output
- **Input**:
  ```json
  {
    "resume_text": "Your resume content here...",
    "job_description": "Your job description here..."
  }

# Instructions to Setup Locally:

1. First, make sure you have **Node.js** installed
2. Then clone this repo into a local directory of your choice
```cmd
git clone https://github.com/ImReaper10/Resume_AnalyzerTm6.git
```
3. Then, go to the backend directory and run npm install in the backend branch
```cmd
cd ./Resume_AnalyzerTm6/backend
npm install
```
4. Next, go to the frontend directory and run npm install 
```cmd
cd ../frontend
npm install
```
5. Finally, go to the tests directory and run npm install 
```cmd
cd ../tests
npm install
```
6. Now, everything should be set up to go

# How to test

## Backend
1. To run the backend tests, first you must go to the backend directory and start the server
   - Option 1
   ```cmd
   cd ../backend
   npm start
   ```
   - Option 2
   ```cmd
   cd ../backend
   node index.js
   ```
2. Then, navigate to the tests directory in another console and run jest
   ```cmd
   cd ./tests
   npm test
   ```
3. If all tests pass, then you should be good to go!

## Frontend
1. To run the frontend tests, you do **NOT** need the backend running, since we use mock requests to the backend during testing. All you have to do is navigate to the frontend directory and run npm test, this may take a little bit. **If a message comes like "No tests found related to files changed since last commit." Type 'a' on your keyboard.**
   ```cmd
   cd ../frontend
   npm test
   ```
2. If all the tests pass, you should be good to go!

# How to run

## Backend
1. Go to the backend directory, and run one of the following:
   - Option 1
   ```cmd
   cd ./backend
   npm start
   ```
   - Option 2
   ```cmd
   cd ./backend
   node index.js
   ```
2. The backend should now be running on localhost:5000
## Frontend
1. Go to the frontend directory, and run:
   ```cmd
   cd ./frontend
   npm start
   ```
2. Once started, go to a web browser and go to http://localhost:3000/