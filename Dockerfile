FROM ubuntu:latest
MAINTAINER John Nelson <jnelson@johncoder.com>

# Install needed tools
RUN apt-get update \
	&& apt-get install -y build-essential libssl-dev git qt5-qmake gcc make g++ nodejs npm \
        && echo $(node --version), $(npm --version)

# Build project
RUN git clone ${BRANCH:+-b $BRANCH} https://github.com/simulationcraft/simc \
	&& cd simc/engine \
	&& make OPENSSL=1 optimized \
	&& mv /simc/engine/simc /bin/simc \
	&& rm -fr /simc

WORKDIR /usr/src/app
EXPOSE 8080

COPY package*.json ./
RUN npm install
COPY apikey.txt /bin
COPY . .

ENTRYPOINT ["node", "index.js"]
