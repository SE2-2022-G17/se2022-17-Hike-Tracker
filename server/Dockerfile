FROM alpine
RUN apk add --update nodejs npm
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
RUN node scripts/populateDB.js
CMD ["npm", "start"]