# Setup instructions for your server

## Requirements
* **Ubuntu 14.04**
* **Git**
* **Node 5.11.0**
* **X Virtual Frame Buffer** (For running Google Chrome or your choice of browser headlessly)
* **Latest Version of NPM**
* **GraphicsMagick**
* **Webdriverio-server**
* **Nginx**
* **Java 1.8**

## Shell Script
To run the shell script and setup the server automatically
```
sudo apt-get install wget
wget -O- https://raw.githubusercontent.com/ciena-blueplanet/webdriverio-server/master/bin/bootstrap/ubuntu/14.04.sh | bash
```
This script should configure everything, including Node, xvfb, and Java

#### Configuring the Webdriverio-server to run as a service
1. Run the command ```tmux``` to enter a tmux session
2. Run the command ```source ~/.bashrc && DISPLAY=:0 DEBUG=server webdriverio-server``` to begin running the webdriverio-server instance
3. Type Ctrl b
4. Type d

If there is any need to enter the tmux session again, run the command ```tmux attach-session```

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

## Sources
[Git](https://help.ubuntu.com/lts/serverguide/git.html)  
[X Virtual Frame Buffer](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml)  
[NodeJS](https://nodejs.org/en)  
[GraphicsMagick](http://www.graphicsmagick.org/index.html)  
[WebDriverIO Server](https://github.com/ciena-blueplanet/webdriverio-server)  
[Java 1.8 Runtime Environment](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)  
[Nginx](http://nginx.org)


