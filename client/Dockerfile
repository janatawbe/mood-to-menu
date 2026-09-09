# Frontend (React + Vite) production image — static build served by Nginx.
#
# Build context is the REPO ROOT (see docker-compose.yml's `context: .`), for the same
# npm-workspaces/shared-lockfile reason explained in server/Dockerfile.

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci

COPY client client
RUN npm run build --workspace=client

# ---- runtime stage ----
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY client/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
