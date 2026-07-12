FROM node:24-alpine AS build

ARG VITE_API_SECURITY_ENABLED=false
ENV VITE_API_SECURITY_ENABLED=${VITE_API_SECURITY_ENABLED}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
