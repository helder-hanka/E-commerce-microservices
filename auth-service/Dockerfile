# # Étape 1 : Build
# FROM node:22-alpine AS builder

# WORKDIR /app

# # Copie des fichiers de dépendances
# COPY package.json package-lock.json ./

# # Installe toutes les dépendances (dev + prod)
# RUN npm install

# # Copie tout le code source
# COPY . .

# # Build de l'application
# RUN npm run build

# # Étape 2 : Image de production
# FROM node:22-alpine AS production

# WORKDIR /app

# # Copie uniquement les fichiers nécessaires
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/package-lock.json ./package-lock.json

# # Installe uniquement les dépendances de prod
# RUN npm install --only=production

# # Copie le build final
# COPY --from=builder /app/dist ./dist

# # Copie les fichiers de configuration si nécessaires (env, etc.)
# # COPY --from=builder /app/.env ./

# EXPOSE 3000

# CMD ["node", "dist/main"]


# Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Étape 2 : exécution
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY .env .env

CMD ["node", "dist/main.js"]
