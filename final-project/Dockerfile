FROM node:24-alpine
# Visual Studio Code --> node -v --> v24.14.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]