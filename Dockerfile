FROM node:18.13.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get -y update
RUN apt-get install -y apt-transport-https
RUN apt-get install -y ffmpeg
RUN apt-get install -y libvips
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

CMD npm run start
