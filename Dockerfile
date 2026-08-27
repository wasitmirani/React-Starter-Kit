# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=https://api.example.com
ARG VITE_API_PREFIX=/api/v1
ARG VITE_WS_BASE_URL=wss://api.example.com
ARG VITE_APP_NAME=AI Voice SaaS
ARG VITE_APP_ENV=production
ARG VITE_USE_MOCK_API=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_PREFIX=$VITE_API_PREFIX \
    VITE_WS_BASE_URL=$VITE_WS_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_USE_MOCK_API=$VITE_USE_MOCK_API
RUN npm run build

# Runtime
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
