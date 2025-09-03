# client/Dockerfile

# --- ETAP "BAZOWY": Wspólna instalacja zależności ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# Instalujemy wszystkie zależności, w tym deweloperskie, aby etap 'dev' działał
RUN npm install

# --- ETAP "DEV": Tylko dla środowiska deweloperskiego ---
FROM base AS dev
WORKDIR /app
# Kopiujemy kod źródłowy (potrzebny dla serwera Vite)
COPY . .
# Domyślne polecenie dla serwera deweloperskiego Vite
CMD ["npm", "run", "dev", "--", "--host"]

# --- ETAP "BUILDER": Budowanie statycznych plików dla produkcji ---
FROM base AS builder
WORKDIR /app
COPY . .
# Tworzymy produkcyjną paczkę
RUN npm run build

# --- ETAP "PROD": Finalny, lekki obraz Nginx dla produkcji ---
FROM nginx:alpine AS prod
# Kopiuj tylko zbudowane pliki z etapu 'builder'
COPY --from=builder /app/dist /usr/share/nginx/html
# Kopiuj konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]