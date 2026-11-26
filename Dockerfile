FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json package-lock.json ./
COPY server.mjs ./
COPY dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
