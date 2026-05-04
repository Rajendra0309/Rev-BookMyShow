FROM cgr.dev/chainguard/node:latest-dev AS build

WORKDIR /app

COPY package*.json ./
USER root
RUN npm install --omit=dev --no-package-lock

COPY . .

FROM cgr.dev/chainguard/node:latest AS runtime

WORKDIR /app

COPY --from=build /app /app

EXPOSE 5000

CMD ["server.js"]
