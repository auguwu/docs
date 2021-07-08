FROM node:16-alpine

LABEL MAINTAINER="Noelware <cutie@floofy.dev>"
RUN apk update && apk add git ca-certificates

WORKDIR /opt/Nino
COPY . .
RUN npm i -g typescript eslint
RUN npm ci
RUN NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production npm run build
RUN rm -rf src
RUN npm cache clean --force

ENTRYPOINT [ "next", "start" ]
