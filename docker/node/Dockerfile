from node:latest

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install && apt update && apt install -y chromium