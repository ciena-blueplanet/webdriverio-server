# A shell script to partially setup an Ubuntu server with the open source webdriverio-server code
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git vvfb graphicsmagick redis-server tmux wget nano vim
git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags` # Script to get the latest version of node version manager
. ~/.nvm/nvm.sh # Run the nvm shell script
nvm install 5.3.0 # Install the 5.3.0 version of NodeJS
nvm use 5.3.0
sudo npm install npm -g # Install the latest version of Node Package Manager
sudo npm install bower -g # Install the latest version of Bower
sudo npm install -g webdriverio-server # Install the webdriverio-server code
webdriverio-server-init # Run the initial shell script associated with webdriverio-server
cd ~/.nvm/versions/node/v5.3.0/lib/node_modules/webdriverio-server/webdriverio-app # This assumes that the front end of the application can be found in this folder
npm install # Install the npm dependencies for the front end
bower install # Install the bower dependencies for the front end
npm install ember-cli -g # This is needed if ember-cli is not already installed. It is used only for the next step.
ember build # This builds the static assets for the front end
cd ~