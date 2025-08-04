FROM node:18

WORKDIR /app

# Installer git
RUN apt-get update && apt-get install -y git

# Kopiér hele repoet ind i containeren
COPY . .

# Installer afhængigheder
RUN npm install

# Start med tsx direkte
CMD ["npx", "tsx", "server/index.ts"]
