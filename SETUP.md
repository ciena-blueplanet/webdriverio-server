# Setup instructions for your server

## Requirements
* **Git**
* **Node 5.3.0** (Using NVM)
* **X Virtual Frame Buffer** (For running Google Chrome or your choice of browser headlessly)
* **NVM**
* **Latest Version of NPM**
* **GraphicsMagick**
* **Webdriverio-server**
* **Redis**

## Shell Script (See setup.sh)
To run the shell script and setup the webserver automatically
```
sudo apt-get install wget
wget -0- https://raw.githubusercontent.com/pastorsj/webdriverio-server/sprint12/bin/bootstrap/ubuntu/14.04.sh | bash
```

## Running the webdriverio-server
1. First, a .bashrc file must be configured. Instructions are below
2. X Virtual Frame Buffer must be running as a service. Run the command ```sudo service xvfb```
3. The webdriverio-server code must be running as a service. Instructions on configuring this are below


#### Configuring the Webdriverio-server to run as a service
1. Run the command ```tmux```
2. Run the command ```webdriverio-server```
3. Type Ctrl b
4. Type d

#### Configuring the RedisDB to use a password
In Ubuntu, the redis.conf file, or the redis configuration file is stored at this location ```/etc/redis```  

1. Shutdown the redis-server by running the command ```redis-cli shutdown```
2. To configure the redis.conf, Type ```nano /etc/redis/redis.conf```
3. Scroll down to the section on security (about halfway to 3/4 of the way down the file)
4. Uncomment the line with requirepass
5. Type in your secret password to the redis server
6. Save and exit nano ('Ctrl x' + 'y' + 'enter')
7. Start the redis-server by typing ```sudo redis-server /etc/redis/redis.conf```
8. To confirm that redis has been secured, type these commands:  

```
redis-server ping
redis-cli
auth your-password
```

If the first command does not return, you have not started the redis-server. It should return 'pong'.

If the redis-server returns 'OK', you have configured Redis correctly.

If the redis-cli returns 'No password set', retry the following steps above. If that does not work, file an issue [here](https://github.com/ciena-blueplanet/webdriverio-server/issues).

#### Confirming the front end is running correctly
Navigate to the server's name in the browser. The website should be displayed.

## Sources
[Git](https://help.ubuntu.com/lts/serverguide/git.html)  
[X Virtual Frame Buffer](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml)  
[NodeJS](https://nodejs.org/en)  
[Node Version Manager](https://github.com/creationix/nvm)  
[GraphicsMagick](http://www.graphicsmagick.org/index.html)  
[WebDriverIO Server](https://github.com/ciena-blueplanet/webdriverio-server)  
[Redis](http://redis.io)  
[Installation Instructions for Redis](https://www.digitalocean.com/community/tutorials/how-to-configure-a-redis-cluster-on-ubuntu-14-04)  


