# Zorbit Platform — Deployment Instructions (Build Only, No Source)

## Prerequisites (run as sudo on target server)

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Install MongoDB 7
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable mongod && sudo systemctl start mongod

# 4. Install PostgreSQL 16
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update && sudo apt-get install -y postgresql-16
sudo systemctl enable postgresql && sudo systemctl start postgresql

# 5. Install Docker (for Kafka)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 6. Install Nginx
sudo apt-get install -y nginx
sudo systemctl enable nginx

# 7. Install Chromium (for PDF generation via Puppeteer)
sudo apt-get install -y chromium-browser

# 8. Create app user and directories
sudo useradd -m -s /bin/bash zorbit
sudo mkdir -p /opt/zorbit-platform
sudo chown zorbit:zorbit /opt/zorbit-platform
```

## Database Setup (run as sudo)

```bash
# PostgreSQL: create user and databases
sudo -u postgres psql -c "CREATE USER zorbit WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE zorbit_identity OWNER zorbit;"
sudo -u postgres psql -c "CREATE DATABASE zorbit_authorization OWNER zorbit;"
sudo -u postgres psql -c "CREATE DATABASE zorbit_navigation OWNER zorbit;"
sudo -u postgres psql -c "CREATE DATABASE zorbit_pii_vault OWNER zorbit;"
sudo -u postgres psql -c "CREATE DATABASE zorbit_audit OWNER zorbit;"

# MongoDB: runs on default port 27017 (no auth needed for single-server)

# Kafka (via Docker)
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  bitnami/kafka:3.7
```

## Deployment Package

The deployment package is a tarball containing ONLY built artifacts (no source code):

```
zorbit-deploy-YYYY-MM-DD.tar.gz
├── services/
│   ├── zorbit-identity/          (dist/ + package.json + .env.example)
│   ├── zorbit-authorization/
│   ├── zorbit-navigation/
│   ├── zorbit-event_bus/
│   ├── zorbit-pii-vault/
│   ├── zorbit-audit/
│   ├── zorbit-pfs-product_pricing/
│   ├── zorbit-pfs-form_builder/
│   ├── zorbit-pfs-doc_generator/
│   ├── zorbit-app-pcg4/
│   ├── zorbit-app-hi_quotation/
│   ├── zorbit-app-uw_workflow/
│   ├── zorbit-app-hi_decisioning/
│   └── zorbit-unified-console/   (static dist/ only)
├── scripts/
│   ├── ecosystem.config.js       (PM2 config for all services)
│   ├── setup-env.sh              (creates .env files from templates)
│   ├── install-deps.sh           (npm install --omit=dev for all)
│   └── nginx-zorbit.conf         (nginx site config)
├── seeds/
│   ├── seed-all.sh               (runs all seed scripts)
│   └── rate-tables/              (AWNIC rate table JSON files)
└── README.md
```

## Deployment Steps (run as zorbit user)

```bash
# 1. Extract package
cd /opt/zorbit-platform
tar -xzf zorbit-deploy-YYYY-MM-DD.tar.gz

# 2. Set up environment files
bash scripts/setup-env.sh
# Edit .env files to set:
#   - DATABASE_PASSWORD (PostgreSQL)
#   - JWT_SECRET (generate: openssl rand -hex 32)
#   - KAFKA_BROKERS
#   - CORS_ORIGINS (your domain)

# 3. Install production dependencies
bash scripts/install-deps.sh

# 4. Start all services
pm2 start scripts/ecosystem.config.js
pm2 save
pm2 startup  # generates sudo command — run that as sudo
```

## Nginx Setup (run as sudo)

```bash
sudo cp scripts/nginx-zorbit.conf /etc/nginx/sites-available/zorbit
sudo ln -sf /etc/nginx/sites-available/zorbit /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

## SSL (run as sudo — only if no wildcard cert exists)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Ports Reference

| Service | Default Port |
|---------|-------------|
| zorbit-identity | 3001 |
| zorbit-authorization | 3002 |
| zorbit-navigation | 3003 |
| zorbit-event_bus | 3004 |
| zorbit-pii-vault | 3005 |
| zorbit-audit | 3006 |
| zorbit-pfs-product_pricing | 3025 |
| zorbit-pfs-form_builder | 3014 |
| zorbit-pfs-doc_generator | 3026 |
| zorbit-app-pcg4 | 3011 |
| zorbit-app-hi_quotation | 3017 |
| zorbit-app-uw_workflow | 3015 |
| zorbit-app-hi_decisioning | 3016 |
| zorbit-unified-console | 80/443 (nginx) |
| PostgreSQL | 5432 |
| MongoDB | 27017 |
| Kafka | 9092 |

## Creating the Deployment Package

Run this on the build machine (source code machine):

```bash
bash /path/to/zorbit/scripts/create-deploy-package.sh
```

This script:
1. Builds all services (npm run build)
2. Copies only dist/ + package.json + package-lock.json + .env.example
3. Includes PM2 ecosystem config
4. Creates the tarball
5. NO source code (.ts files) included
