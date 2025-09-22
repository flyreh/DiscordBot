FROM node:22-alpine

# Update packages to get security fixes
RUN apk update && apk upgrade --no-cache
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    bash \
    libc6-compat \
    ffmpeg

# lugar donde se va a ejecutar la app dentro del contenedor
WORKDIR /app
# referencia a los archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN addgroup -g 1001 -S nodejs && \
    adduser -S discordbot -u 1001 -G nodejs && \
    chown -R discordbot:nodejs /app

USER discordbot

EXPOSE 3000

CMD [ "npm", "start" ]

