FROM node:24 AS base

# Usage example:
# docker build --no-cache --tag sunrise-cms:local .
# docker run --rm --detach --name sunrise-cms --publish 9000:9000 --mount type=bind,src=%CD%/data/testing.config.js,dst=/app/data/config.js sunrise-cms:local
# docker rm sunrise-cms --force

WORKDIR /app
COPY package*.json ./

# for production builds - but since we have dev dependencies, we need to use npm ci without --omit=dev
#RUN npm ci --omit=dev && npm cache clean --force
RUN npm ci && npm cache clean --force

COPY ./ .

EXPOSE 9000/tcp

HEALTHCHECK --interval=1m --timeout=3s --retries=3 \
    CMD curl -f http://localhost:9000 || exit 1

VOLUME /app/data/backups
VOLUME /app/data/sessions
VOLUME /app/data/database
VOLUME /app/public-internal

ENTRYPOINT ["npm" ,"start"]
