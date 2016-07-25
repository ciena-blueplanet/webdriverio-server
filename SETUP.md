# Setup instructions for your server

## Requirements
* **Ubuntu 14.04**
* **Git**
* **Node 5.11.0**
* **X Virtual Frame Buffer** (For running Google Chrome or your choice of browser headlessly)
* **Latest Version of NPM**
* **GraphicsMagick**
* **Webdriverio-server**
* **Redis**
* **Nginx**
* **Java 1.8**

## Shell Script
To run the shell script and setup the server automatically
```
sudo apt-get install wget
wget -O- https://raw.githubusercontent.com/ciena-blueplanet/webdriverio-server/master/bin/bootstrap/ubuntu/14.04.sh | bash
```
This script should configure everything, including Node, Redis, xvfb, and Java

#### Configuring the Webdriverio-server to run as a service
1. Run the command ```tmux``` to enter a tmux session
2. Run the command ```source ~/.bashrc && DISPLAY=:0 DEBUG=server webdriverio-server``` to begin running the webdriverio-server instance
3. Type Ctrl b
4. Type d

If there is any need to enter the tmux session again, run the command ```tmux attach-session```

#### Configuring the RedisDB to use a password
In Ubuntu, the redis.conf file, or the redis configuration file is stored at this location ```/etc/redis```  

1. Shutdown the redis-server by running the command ```redis-cli shutdown```
2. To configure the redis.conf, type ```nano /etc/redis/redis.conf```
3. Scroll down to the section on security (about halfway to 3/4 of the way down the file)
4. Uncomment the line with 'requirepass'
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
Navigate to the server's name in the browser. The website should be displayed. If running on localhost, navigate to localhost:3000

#### Configuring the Deployment URL
When using requesting an Access token using the GitHub API, it requires the code to pass a redirection URL with the servers name.
This is ignored on the webdriverio-server repository, but it is required when running the server. In the base directory create a config.json file containing


```
{
  "url": "the-url-of-this-server"
}
```

#### Congiuring Travis CI
When running e2e tests on TravisCI, we using the commit number to determine the username of the person who committed the code. This means we use the GitHub api to 
determine this information. However, the GitHub api limits the number of hits by a given IP address to 60 per hour. This means that Travis is limited when connecting
to the API. To set up the TravisCI repository and not have these problems, one must use a Personal Access Token that can be aquired [here](https://help.github.com/articles/creating-an-access-token-for-command-line-use/)


In the Travis repository, add this personal access token as the environment variable GITHUB_PAT. This should allow the Travis repository to hit the GitHub api at 60 times an hour 
without worrying about going over the limit, unless you run more than 60 builds per hour. More information can be found [here](http://www.r-bloggers.com/using-travis-make-sure-you-use-a-github-pat/)


## Sources
[Git](https://help.ubuntu.com/lts/serverguide/git.html)  
[X Virtual Frame Buffer](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml)  
[NodeJS](https://nodejs.org/en)  
[GraphicsMagick](http://www.graphicsmagick.org/index.html)  
[WebDriverIO Server](https://github.com/ciena-blueplanet/webdriverio-server)  
[Redis](http://redis.io)  
[Installation Instructions for Redis](https://www.digitalocean.com/community/tutorials/how-to-configure-a-redis-cluster-on-ubuntu-14-04)  
[Java 1.8 Runtime Environment](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)  
[Nginx](http://nginx.org)


