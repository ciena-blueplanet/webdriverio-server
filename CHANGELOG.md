# 3.0.2
- Finished the process of removing the UI
- Added better documentation for how to set up the docker system

# 3.0.1
When running webdriverio-server in a docker container, we need to have NENV environment variable set.

# 3.0.0
A lot of the client-side functionality we didn't end up using and we were wasting resources trying to maintain it. Therefore, let's pull it out and focus on the core use-case of webdriverio-server

# 2.6.0
* Added e2e tests
* Integrated TravisCI by restricting connections with specific IP addresses

# 2.5.0
* Added Passport authentication to protect routes and bolster login system
* Updated contract route to include a `fake` contract and a way to generate a token for a developer
* Customized denied route to include 5+ reasons why a user was denied access to the server
* Enabled the ability for authenticated users to submit tar balls with e2e tests to the server using their GitHub username and token
* Secured the backend from unauthorized people attempting to send malicious tarballs

# 2.4.1
* Fixed a path in a generate token test

# 2.4.0
* Added the ability for a developers to authorize their account through GitHub OAuth
* Updated the admin portal to look more professional
* Included the ability to restrict a user by changing their token
* Added the ability to further verify a developer's account using the GitHub api

# 2.3.1
* Deleted /routes from npmignore

# 2.3.0
* Added an Admin Portal, allowing administrators to add developers automatically to the server without verifying with GitHub
* Updated backend express application to work with ember-data requests
* Updated server-side script to work with Ubuntu 16.04 and automatically setup the front end application

# 2.2.0
* Added a developer route to interact with RedisDB
* Added front end application with basic functionality

