
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
The AI-Powered Resume Analyzer is an innovative platform designed to assist users in refining their resumes in relation to a given job description. By leveraging advanced Natural Language Processing (NLP) and machine learning, the platform provides actionable feedback.


## Description
This platform enables users to:
- Upload resumes as PDFs or DOCX.
- Upload a Job Description.
- Receive detailed, AI-driven feedback on:
  - Wording and structure improvements.
  - Missing skills or qualifications.
  - Suggestions for aligning their resumes with desired job descriptions.

The system is designed to help job seekers optimize their resumes for specific roles and improve their chances of landing their desired jobs.


## Technical Overview

### Tech Stack
1. **Backend**:
   - **Primary Framework**: Express (Node.js).
   - **Core Features**: File handling, user authentication, NLP integration.
2. **Frontend**:
   - React.js for dynamic and user-friendly interfaces.
3. **NLP**:
   - Pre-trained NLP models via OpenAI.
4. **Communication**:
   - REST APIs to connect frontend and backend seamlessly.


## Before we move on to how to use our website, here are links to other docs
API Docs: [Link to API Documentation](docs/API_DOCUMENTATION.md)

Setup: [Link to setup](docs/SETUP.md)

# How to use our website
1. When you open the website, you will see the below:

![Login page](/docs/images/loginpage.png)

2. If this is your first time, press the **Go to Sign Up** and you see the sign up page:

![Sign Up page](/docs/images/signuppage.png)

3. You can then type in an email, username, password for your account. Your password must have at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.

![Signed up](/docs/images/signedup.png)

4. Then, type in your email and password, which will bring you to a resume upload and job description upload page.

![Resume and Job Page](/docs/images/resumeandjobpage.png)

5. Next, select a resume file (which must be less than 2MB and 5000 characters) and type or paste a job description. Then hit **Upload**, this will take you to the following page:

![Fit Score Page](/docs/images/fitscore.png)

6. You can use the links on the side to browse the analysis results once they are loaded ("Fit Score", "Keywords", and "Suggestions"). Here are two of the pages:

![Keywords Page](/docs/images/keywords.png)

![Suggestions Page](/docs/images/suggestions.png)

7. On the suggestions page, you can use the dropdown to filter by what type of suggestions you want to view:

![Suggestions Page 2](/docs/images/suggestions2.png)

8. On the fit score page you can download a PDF of **all** the analysis results, this is what that PDF should look like:

![PDF Example](/docs/images/pdfexample.png)

9. Then, you could click **Upload another** which will delete your data on the backend and also bring you back to the upload page

10. Also, in the top right of the page, you can sign out by clicking the **Sign Out** button, bringing you back to the login page.

# Instructions to Setup Locally:

## Preliminary Requirements
1. First, you will need an OpenAI API account (https://platform.openai.com/), you will have to set up billing in your profile settings in order to use the API
2. Once you have set up billing, navigate to your API Keys and click "Create new secret key" and ensure all permissions are granted, or if you already have a secret key continue
3. Finally, in whatever terminal you are using to run the **backend** (more on the backend later) set an enviromental variable **OPENAI_API_KEY** to your secret key:
   - For example, in VS Code powershell you would do:
   ```cmd
   $env:OPENAI_API_KEY="sk-..."
   ```
4. Next, make sure you have Node.js and Git installed on your system
5. Now all preliminary steps are finished!

## Remaining Setup
1. Clone this repo into a local directory of your choice
```cmd
git clone https://github.com/ImReaper10/Resume_AnalyzerTm6.git
```
2. Then, go to the backend directory and run npm install in the backend branch
```cmd
cd ./Resume_AnalyzerTm6/backend
npm install
```
3. Next, go to the frontend directory and run npm install 
```cmd
cd ../frontend
npm install
```
4. Finally, go to the tests directory and run npm install 
```cmd
cd ../tests
npm install
```
5. Now, everything should be set up to go

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

## End to end tests
1. These tests require both the frontend and backend to **both be running**, so follow both of the instructions at the bottom of page **first** to run both
2. Now, navigate to the tests directory
   ```cmd
   cd ./tests
   ```
3. Once you are here, you have two options to run the end to end tests
   - Option 1 (preferred), through UI. Once the UI opens up, click on **E2E testing**, then choose a browser (note that Firefox may have some issues due to the way downloads are treated), then click **Start E2E Testing in *Browser***, then click on **complete_tests.cy.js**, then the tests will run
   ```cmd
   npx cypress open
   ```
   - Option 2, Headless
   ```cmd
   npx cypress run --browser chrome
   ```

# How to run

## Backend
1. First, in whatever terminal you want to run the backend in be sure to set up an enviromental variable **OPENAI_API_KEY** to your OpenAI API secret key:
   - For example, in VS Code powershell you would do:
   ```cmd
   $env:OPENAI_API_KEY="sk-..."
   ```
2. Now go to the backend directory, and run one of the following:
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
3. The backend should now be running on localhost:5000

## Frontend
1. Go to the frontend directory, and run:
   ```cmd
   cd ./frontend
   npm start
   ```
2. Once started, go to a web browser and go to http://localhost:3000/
