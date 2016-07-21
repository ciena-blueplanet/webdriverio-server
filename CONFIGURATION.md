## Configuration Instructions for sending e2e tests to the webdriverio-server
1. Create a config.json file in the tests/e2e directory of your project
2. Inside of the config.json, add the following lines of code
  ```
  {
    "username": "insert-your-username-here",
    "token": "insert-your-testing-token-here"
  }
  ```
3. You are all good to go!

## Note to developers
You should make sure to add the config.json file to your .gitignore. If the file is comprimised, people can use your credentials to send tests 
to the server without restrictions.