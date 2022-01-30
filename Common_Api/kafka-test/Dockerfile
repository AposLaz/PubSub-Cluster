FROM node:10
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g nodemon
RUN npm install 
COPY . .
EXPOSE 3030
CMD ["npm","start"]