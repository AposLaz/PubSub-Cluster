FROM node:10
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN apt-get update
RUN apt-get install --yes python3
RUN apt-get install --yes python3-pip
RUN python3 -m pip install pip 
RUN apt-get update
#python3.5.3 is out of date in january 2021.It will need update
#RUN apt-get install python3-distutils
RUN apt-get install --yes python3-setuptools 
RUN python3 -m pip install --upgrade pip
RUN pip install rfc3987
RUN npm install -g nodemon
RUN npm install 
COPY . .
EXPOSE 3000
CMD ["npm","start"]