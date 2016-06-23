#!/usr/bin/env bash
set -x
{ # this ensures the entire script is downloaded

# Install the base dependencies
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    curl \
    git \
    graphicsmagick \
    libcurl4-openssl-dev \
    libcairo2 \
    nginx \
    python-pip \
    unzip \
    redis-server \
    tmux

# Install nodeenv and node version (defined by NODE_VERSION environment variable)
if [ -z "$NODE_VERSION" ]
then
    NODE_VERSION=5.11.0
fi

# Installing Node using NVM
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
source ~/.profile
. ~/.nvm/nvm.sh

nvm install 5.11.0

# sudo pip install nodeenv
# sudo mkdir -p /opt/node-envs
# cd /opt/node-envs
# sudo nodeenv --node=$NODE_VERSION --prebuilt $NODE_VERSION
# cd -
# USER_GROUP=$(groups $USER | awk '{print $1;}')
# sudo chown -R $USER:$USER_GROUP /opt/node-envs

# Install xvfb, chrome and firefox
sudo sh -c 'curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y xvfb firefox google-chrome-stable
sudo apt-get clean

# Configure xvfb
cat << EOF > xvfb.service
XVFB=/usr/bin/Xvfb
XVFBARGS=":0 -screen 0 1024x768x24 -ac +extension GLX +render -noreset"
PIDFILE=/var/run/xvfb.pid
case "\$1" in
    start)
        echo -n "Starting virtual X frame buffer: Xvfb"
        start-stop-daemon --start --quiet --pidfile \$PIDFILE --make-pidfile --background --exec \$XVFB -- \$XVFBARGS
        echo "."
        ;;
    stop)
        echo -n "Stopping virtual X frame buffer: Xvfb"
        start-stop-daemon --stop --quiet --pidfile \$PIDFILE
        echo "."
    ;;
    restart)
        \$0 stop
        \$0 start
    ;;
    *)
        echo "Usage: /etc/init.d/xvfb {start|stop|restart}"
        exit 1
    esac

exit 0
EOF

chmod +x xvfb.service
sudo mv xvfb.service /etc/init.d/xvfb
sudo service xvfb start

# Download and extract Java
JAVA_URL=http://download.oracle.com/otn-pub/java/jdk/8u65-b17/jdk-8u65-linux-x64.tar.gz
sudo mkdir -p /usr/lib/jvm
sudo wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" $JAVA_URL
sudo tar -zxvf jdk-8u65-linux-x64.tar.gz -C /usr/lib/jvm
sudo rm jdk-8u65-linux-x64.tar.gz

# Configure Java
sudo update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/jdk1.8.0_65/bin/java" 1
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/jdk1.8.0_65/bin/javac" 1
sudo update-alternatives --install "/usr/bin/javaws" "javaws" "/usr/lib/jvm/jdk1.8.0_65/bin/javaws" 1
sudo chmod a+x /usr/bin/java
sudo chmod a+x /usr/bin/javac
sudo chmod a+x /usr/bin/javaws

# Configure nginx
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.default
cat << EOF > nginx.conf
worker_processes 1;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;

    sendfile on;

    keepalive_timeout 65;

    ##
    # Gzip Settings
    ##

    gzip on;
    gzip_disable "msie6";

    server {
        listen 80;
        server_name localhost;

        charset utf-8;

        ssl off;

        location / {
            # increase max upload size to 200MB
            client_max_body_size 200M;
            proxy_pass http://localhost:3000/;
        }
    }

    server {
        listen 81;
        server_name localhost;

        charset utf-8;

        ssl off;

        location / {
            # increase max upload size to 200MB
            client_max_body_size 200M;
            proxy_pass http://localhost:3001/;
        }
    }
}
EOF
sudo mv nginx.conf /etc/nginx/nginx.conf

# Reload with the new config
sudo service nginx reload

# Start redis server
sudo service redis-server restart

npm install bower -g

# A temporary solution
git clone https://github.com/pastorsj/webdriverio-server.git
cd webdriverio-server
git checkout sprint12
npm install
bower install
cd ~

# npm install -g webdriverio-server bower && webdriverio-server-init

# Setup the front end
# cd ~/.nvm/versions/node/v5.11.0/lib/node_modules/webdriverio-server/webdriverio-app
# cd /opt/node-envs/5.11.0/lib/node_modules/webdriverio-server/webdriverio-app
# bower install # Install the bower dependencies for the front end
# ember build # This builds the static assets for the front end
# cd ~

# Setup .bashrc
echo "source ~/.bashrc" >> ~/.bash_profile
echo 'export NVM_DIR="$HOME/.nvm' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh' >> ~/.bashrc
echo "Please source ~/.bashrc to complete setup"
echo "After the initial run, to run it again, you should only need:"
echo "\$ source ~/.bashrc && DISPLAY=:0 DEBUG=server webdriverio-server"
echo ""

echo "To run webdriverio-server as a service using tmux, follow the end of SETUP.md"
echo "at https://github.com/pastorsj/webdriverio-server/blob/sprint12/SETUP.md"

} # this ensures the entire script is downloaded
