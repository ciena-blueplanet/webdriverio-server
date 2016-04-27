#!/usr/bin/env bash

{ # this ensures the entire script is downloaded

# Install the base dependencies
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    curl \
    git \
    python-pip \
    libcurl4-openssl-dev \
    graphicsmagick \
    libcairo2 \
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

} # this ensures the entire script is downloaded
