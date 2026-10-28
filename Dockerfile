
# =========================================================
# ETAPA 1: Compilar o backend (Node.js + TypeScript)
# =========================================================
FROM node:22-alpine AS backend-build

WORKDIR /app/backend

COPY app/backend/package*.json ./
RUN npm ci

COPY app/backend/tsconfig.json ./
COPY app/backend/src ./src

RUN npm run build


# =========================================================
# ETAPA 2: Instalar somente dependências de produção
# =========================================================
FROM node:22-alpine AS backend-deps

WORKDIR /app/backend

COPY app/backend/package*.json ./
RUN npm ci --omit=dev


# =========================================================
# ETAPA 3: Compilar o frontend (React + Vite)
# =========================================================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY app/frontend/package*.json ./
RUN npm ci

COPY app/frontend/ ./

# A API será acessada pelo caminho relativo /api
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


# =========================================================
# ETAPA 4: Imagem final com Node.js + Nginx
# =========================================================
FROM node:22-alpine AS production

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8000

# Instala o Nginx na imagem final
RUN apk add --no-cache nginx \
    && mkdir -p /run/nginx /usr/share/nginx/html

# Copia a API compilada e suas dependências de produção
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY --from=backend-deps /app/backend/package.json ./package.json

# Copia os arquivos estáticos do frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Configura o Nginx para servir o frontend e encaminhar /api
RUN printf '%s\n' \
    'server {' \
    '    listen 8080;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location /api/ {' \
    '        proxy_pass http://127.0.0.1:8000;' \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Host $host;' \
    '        proxy_set_header X-Real-IP $remote_addr;' \
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
    '        proxy_set_header X-Forwarded-Proto $scheme;' \
    '    }' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '}' > /etc/nginx/http.d/default.conf

EXPOSE 8080

# Inicia a API e mantém o Nginx em primeiro plano
CMD ["sh", "-c", "node /app/backend/dist/server.js & exec nginx -g 'daemon off;'"]
