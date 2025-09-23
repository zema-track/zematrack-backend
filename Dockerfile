FROM node:lts-alpine

RUN addgroup mikiyas && adduser -S mikiyas -G mikiyas

WORKDIR /app

RUN mkdir -p /app/dist && \
    chown -R mikiyas:mikiyas /app

USER mikiyas

COPY --chown=mikiyas:mikiyas package.json package-lock.json* ./

RUN npm ci --prefer-offline

COPY --chown=mikiyas:mikiyas . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
