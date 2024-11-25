# Frontend

## How to test the Frontend
1. To run the frontend tests, you do **NOT** need the backend running, since we use mock requests to the backend for testing. All you have to do is navigate to the frontend directory and run npm test, this may take a little bit. **If a message comes like "No tests found related to files changed since last commit." Type 'a' on your keyboard.**
    ```cmd
    cd ./frontend
    npm test
    ```
2. If all the tests pass, you should be good to go!

## How to run the Frontend

1. Go to the frontend directory, and run:
   ```cmd
   cd ./frontend
   npm start
   ```
2. Once started, go to a web browser and go to http://localhost:3000/
    - Note that you will need to run the server as well to actually use the website
        - If you want, you can go to the console and type localStorage.setItem("useMock", "yes") and refresh and that will let you mock the server being up and running