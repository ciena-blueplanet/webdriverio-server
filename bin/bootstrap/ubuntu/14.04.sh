#!/usr/bin/env bash

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
    unzip

# Install nodeenv and node version (defined by NODE_VERSION environment variable)
if [ -z "$NODE_VERSION" ]
then
    NODE_VERSION=5.11.0
fi

sudo pip install nodeenv
sudo mkdir -p /opt/node-envs
cd /opt/node-envs
sudo nodeenv --node=$NODE_VERSION --prebuilt $NODE_VERSION
cd -
USER_GROUP=$(groups $USER | awk '{print $1;}')
sudo chown -R $USER:$USER_GROUP /opt/node-envs

# Install xvfb, chrome and firefox
sudo sh -c 'curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y xvfb firefox google-chrome-stable
sudo apt-get clean

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

# Setup .bashrc
echo "source ~/.bashrc" >> ~/.bash_profile
echo "# Activate a node version from nodeenv" >> ~/.bashrc
echo "source /opt/node-envs/${NODE_VERSION}/bin/activate" >> ~/.bashrc
echo "Please source ~/.bashrc to complete setup"
echo "You can then do the following to run webdriverio-server:"
echo ""
echo "\$ npm install -g webdriverio-server"
echo "\$ webdriverio-server-init"
echo "\$ DEBUG=server webdriverio-server"
echo ""

} # this ensures the entire script is downloaded
