# ---------- Stage 1: Build React ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Required for Vite
ENV PORT=7860
ENV BASE_PATH=/

RUN npm run build


# ---------- Stage 2: Build Backend ----------
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server .

RUN npm run build


# ---------- Stage 3: Production ----------
FROM node:20-alpine

WORKDIR /app/server

COPY --from=backend-builder /app/server ./

# Copy React build
COPY --from=frontend-builder /app/dist/public ./public

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["npm", "start"]