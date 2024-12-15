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

## End to end tests
1. These tests require both the frontend and backend to **both be running**, so follow both of the instructions at the bottom of page **first** to run both
2. Now, navigate to the tests directory
   ```cmd
   cd ./tests
   ```
3. Once you are here, you have two options to run the end to end tests
   - Option 1 (preferred), through UI. Once the UI opens up, click on **E2E testing**, then choose a browser (note that Firefox may have some issues due to the way downloads are treated), then click **Start E2E Testing in *Browser***, then click on **complete_tests.cy.js**, then the tests will run and if all goes well, they should pass
   ```cmd
   npx cypress open
   ```
   - Option 2, Headless
   ```cmd
   npx cypress run --browser chrome
   ```