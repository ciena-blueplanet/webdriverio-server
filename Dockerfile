FROM ubuntu:xenial

#######################################################################
#                           Basic platform                            #
#######################################################################

RUN apt-get -y update

# Install the base dependencies
RUN apt-get install -y \
    build-essential \
    curl \
    git \
    graphicsmagick \
    libcurl4-openssl-dev \
    libcairo2 \
    nginx \
    python-pip \
    unzip \
    lsof \
    wget \
    tmux

#######################################################################
#                   Essential Selenium dependencies                   #
#######################################################################

#############################################
#  X virtual Frame buffer, Chrome, Firefox  #
#############################################

RUN sh -c 'curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y xvfb google-chrome-stable
RUN apt-get clean
# Version 35 is all that works with Selenium!
# See https://github.com/SeleniumHQ/selenium/issues/1915
RUN wget sourceforge.net/projects/ubuntuzilla/files/mozilla/apt/pool/main/f/firefox-mozilla-build/firefox-mozilla-build_35.0.1-0ubuntu1_amd64.deb
RUN dpkg -i firefox-mozilla-build_35.0.1-0ubuntu1_amd64.deb

COPY xvfb.service /etc/init.d/xvfb
RUN chmod +x /etc/init.d/xvfb
RUN /etc/init.d/xvfb start

##########
#  Java  #
##########

ENV JAVA_URL=http://download.oracle.com/otn-pub/java/jdk/8u65-b17/jdk-8u65-linux-x64.tar.gz
RUN mkdir -p /usr/lib/jvm
RUN wget --no-check-certificate --quiet --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" $JAVA_URL
RUN tar -zxf jdk-8u65-linux-x64.tar.gz -C /usr/lib/jvm
RUN rm jdk-8u65-linux-x64.tar.gz
RUN update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/jdk1.8.0_65/bin/java" 1
RUN update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/jdk1.8.0_65/bin/javac" 1
RUN update-alternatives --install "/usr/bin/javaws" "javaws" "/usr/lib/jvm/jdk1.8.0_65/bin/javaws" 1
RUN chmod a+x /usr/bin/java /usr/bin/javac /usr/bin/javaws

###########
#  Nginx  #
###########

# RUN cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.default
# COPY nginx.conf /etc/nginx/nginx.conf
# RUN service nginx reload


#######################################################################
#                            Install Node                             #
#######################################################################

ENV NODE_VERSION=6.9.2 \
 NENV=nenv \
 DISPLAY=:0

RUN mkdir /opt/node-envs
RUN pip install nodeenv
RUN nodeenv -n $NODE_VERSION /opt/node-envs/$NODE_VERSION

COPY $NENV /usr/local/bin/$NENV
RUN chmod +x /usr/local/bin/$NENV

RUN $NENV npm install bower -g

########################################
#  install or copy webdriverio-server  #
########################################

RUN $NENV npm install -g webdriverio-server
# RUN mkdir /opt/node-envs/$NODE_VERSION/lib/node_modules/npm/node_modules/webdriverio-server
# COPY . /opt/node-envs/$NODE_VERSION/lib/node_modules/npm/node_modules/webdriverio-server
# RUN ln -s /opt/node-envs/$NODE_VERSION/lib/node_modules/npm/node_modules/webdriverio-server/scripts/init.sh /opt/node-envs/$NODE_VERSION/bin/webdriverio-server-init
# RUN chmod a+x /opt/node-envs/$NODE_VERSION/bin/webdriverio-server-init

RUN $NENV webdriverio-server-init

ENV PORT=3001 \
 DEBUG=server

RUN apt-get install -y vim

EXPOSE 3001
# EXPOSE 4444
# EXPOSE 8080
# EXPOSE 80

CMD $NENV webdriverio-server
#CMD bash
