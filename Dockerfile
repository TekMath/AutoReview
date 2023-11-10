FROM node:latest

WORKDIR /app/review
COPY . .

RUN npm install
RUN npm install -g typescript
RUN tsc

CMD ["node", "dist"]
