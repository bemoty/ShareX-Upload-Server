FROM node:alpine

WORKDIR /home/sharex/
COPY src .
COPY package.json .

RUN apk --no-cache add exiftool && \
    npm i

EXPOSE 80 443
CMD ["node", "index.js"]
