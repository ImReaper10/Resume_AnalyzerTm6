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