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
   npx jest
   ```
3. If all tests pass, then you should be good to go!

## Frontend
1. To run the frontend tests, you do **NOT** need the backend running, since we use mock requests to the backend during testing. All you have to do is navigate to the frontend directory and run npm test, this may take a little bit. **If a message comes like "No tests found related to files changed since last commit." Type 'a' on your keyboard.**
    ```cmd
    cd ../frontend
    npm test
    ```
2. If all the tests pass, you should be good to go!