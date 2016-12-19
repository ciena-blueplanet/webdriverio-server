FROM ubuntu:xenial

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
    wget \
    tmux

# Install xvfb, chrome and firefox
RUN sh -c 'curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y xvfb firefox google-chrome-stable
RUN apt-get clean

COPY xvfb.service /etc/init.d/xvfb
RUN chmod +x /etc/init.d/xvfb
RUN service xvfb start

# Download and extract Java
ENV JAVA_URL http://download.oracle.com/otn-pub/java/jdk/8u65-b17/jdk-8u65-linux-x64.tar.gz
RUN mkdir -p /usr/lib/jvm
RUN wget --no-check-certificate --quiet --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" $JAVA_URL
RUN tar -zxf jdk-8u65-linux-x64.tar.gz -C /usr/lib/jvm
RUN rm jdk-8u65-linux-x64.tar.gz

# Configure Java
RUN update-alternatives --install "/usr/bin/java" "java" "/usr/lib/jvm/jdk1.8.0_65/bin/java" 1
RUN update-alternatives --install "/usr/bin/javac" "javac" "/usr/lib/jvm/jdk1.8.0_65/bin/javac" 1
RUN update-alternatives --install "/usr/bin/javaws" "javaws" "/usr/lib/jvm/jdk1.8.0_65/bin/javaws" 1
RUN chmod a+x /usr/bin/java
RUN chmod a+x /usr/bin/javac
RUN chmod a+x /usr/bin/javaws

# Configure nginx
RUN cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.default
COPY nginx.conf /etc/nginx/nginx.conf
RUN service nginx reload


# Install nodeenv and node version (defined by NODENV_VERSION environment variable)
ENV NODENV_VERSION 6.9.2
ENV ENV_DIR /.ci-env
ENV DISPLAY :0

# Create an nenv wrapper to activate nodeenv
RUN mkdir /opt/node-envs
RUN pip install nodeenv
RUN nodeenv -n $NODENV_VERSION /opt/node-envs/$NODENV_VERSION

COPY nenv /usr/local/bin/nenv
RUN chmod +x /usr/local/bin/nenv
COPY npmrc ~/.npmrc



# # setup the nvm environment
# RUN git clone https://github.com/creationix/nvm.git $HOME/.nvm
# RUN echo '\n#The Following loads nvm, and install Node.js which version is assigned to $NODE_ENV' >> $HOME/.profile
# RUN echo '. ~/.nvm/nvm.sh' >> $HOME/.profile
# RUN echo 'echo "Installing node@${NODE_VERSION}, this may take several minutes..."' >> $HOME/.profile
# RUN echo 'nvm install ${NODE_VERSION}' >> $HOME/.profile
# RUN echo 'nvm alias default ${NODE_VERSION}' >> $HOME/.profile
# RUN echo 'echo "Install node@${NODE_VERSION} finished."' >> $HOME/.profile
RUN nenv npm install bower -g

RUN nenv npm install -g webdriverio-server
RUN nenv webdriverio-server-init

ENV PORT 3001
ENV DEBUG server
CMD nenv webdriverio-server
# ENTRYPOINT ["/bin/bash", "--login", "-i", "-c"]
CMD ["/bin/bash"]
