# Setup instructions for your server

## Requirements
Git
Node 5.3.0 (Using NVM)
X Virtual Frame Buffer (For running Google Chrome Headlessly) (https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
NVM (https://github.com/creationix/nvm) (git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`) (. ~/.nvm/nvm.sh) (nvm install 5.3.0) (nvm use 5.3.0)
Latest Version of NPM (sudo npm install npm -g)
GraphicsMagick (http://www.graphicsmagick.org/README.html#installation) For Linux, use 'apt-get' (sudo apt-get install graphicsmagick)
Webdriverio-server (https://github.com/ciena-blueplanet/webdriverio-server) (
Redis (https://www.digitalocean.com/community/tutorials/how-to-configure-a-redis-cluster-on-ubuntu-14-04) (sudo apt-get install redis-server)
## Shell Script (Command Line Instructions)
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git vvfb graphicsmagick redis-server tmux
git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`
. ~/.nvm/nvm.sh
nvm install 5.3.0
nvm use 5.3.0
sudo npm install npm -g
sudo npm install -g webdriverio-server
webdriverio-server-init
cd ~/.nvm/versions/node/v5.3.0/lib/node_modules/webdriverio-server/webdriverio-app
npm install
bower install
// npm install ember-cli -g
ember build
cd ~


## Running the webdriverio-server
1) First, a .bashrc file must be configured. Instructions are below
2) X Virtual Frame Buffer must be running as a service. Run the command ```sudo service xvfb```
3) The webdriverio-server code must be running as a service. Instructions on configuring this are below

#### Configuring the .bashrc and .bash_profile files
1) Create a .bash_profile file by typing ```sudo nano ~/.bash_profile```
2) Type 'source ~/.bashrc' into the .bash_profile file
3) Type 'Ctrl x', then 'y', then enter, to save the file
4) Create a .bashrc file by typing sudo ```nano ~/.bashrc```
5) Type the following lines into the .bashrc file
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
    export DISPLAY = :0
6) Run step 3 again to save the file
7) Exit out of the server, and then ssh back in
8) To confirm that files are written correctly, type 'echo $DISPLAY'. This should return :0. Then type 'node -v'. This should return 5.3.0.

#### Configuring the Webdriverio-server to run as a service
1) Run the command ```tmux```
2) Run the command ```webdriverio-server```
3) Type Ctrl b
4) Type d

#### Configuring the RedisDB to use a password
In Ubuntu, the redis.conf file, or the redis configuration file is stored at this location ```/etc/redis```
1) Shutdown the redis-server by running the command ```redis-cli shutdown```
1) To configure the redis.conf, Type ```nano /etc/redis/redis.conf```
2) Scroll down to the section on security (about halfway to 3/4 of the way down the file)
3) Uncomment the line with requirepass
4) Type in your secret password to the redis server
5) Save and exit nano ('Ctrl x' + 'y' + 'enter')
6) Start the redis-server by typing ```sudo redis-server /etc/redis/redis.conf```
7) To confirm that redis has been secured, type these commands:
```
redis-server ping
redis-cli
auth your-password
```
If the first command does not return, you have not started the redis-server. It should return 'pong'.

If the redis-server returns 'OK', you have configured Redis correctly.

If the redis-cli returns 'No password set', retry the following steps above. If that does not work, file an issue [here](https://github.com/ciena-blueplanet/webdriverio-server/issues).

#### Confirming the front end is running correctly
Navigate to the server's name in the browser. The website should be displayed

## Sources
[Git](https://help.ubuntu.com/lts/serverguide/git.html)
[X Virtual Frame Buffer](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
[NodeJS](https://nodejs.org/en)
[Node Version Manager](https://github.com/creationix/nvm)
[GraphicsMagick](http://www.graphicsmagick.org/index.html)
[WebDriverIO Server](https://github.com/ciena-blueplanet/webdriverio-server)
[Redis](http://redis.io)
[Installation Instructions for Redis](https://www.digitalocean.com/community/tutorials/how-to-configure-a-redis-cluster-on-ubuntu-14-04)


