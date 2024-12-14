# Backend

## How to test the backend
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
