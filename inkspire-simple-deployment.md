# Inkspire — Single EC2 AWS Deployment

# 1. Launch the EC2 Instance

Launch an EC2 instance from the AWS Console.

### Instance

- Amazon Linux 2023
- ARM64 instance/AMI was used.
- Select an inexpensive instance appropriate for the portfolio workload.
- Use the default VPC.
- Place the instance in a public subnet.
- Enable a public IPv4 address.

### Security Group

Initially configure inbound access for the services that need to be public.

Final intended inbound rules:

```text
HTTP   80    0.0.0.0/0
HTTPS  443   0.0.0.0/0
```

Do not expose:

```text
5432  PostgreSQL
6379  Redis
4000  API
```

SSH/22 is not required because Session Manager is used.

### IAM Instance Role

Create/attach an EC2 instance role with the permissions required for Systems Manager / Session Manager.
Also attach S3 permissions

---

# 2. Install Docker

Amazon Linux provides Docker through its own repository.

Check availability:

```bash
sudo dnf list --available '*docker*'
```

Install:

```bash
sudo dnf install docker
```

Enable and start Docker:

```bash
sudo systemctl enable --now docker
```

Check:

```bash
sudo systemctl status docker
docker version
```

Allow the Session Manager user to use Docker without sudo:

```bash
sudo usermod -aG docker ssm-user
```

Exit the Session Manager session and reconnect so the group membership is refreshed.

Verify:

```bash
groups
docker ps
```

---

# 3. Docker Buildx

The Amazon Linux Docker package provided an older Buildx version.

The problem encountered was:

```text
compose build requires buildx 0.17.0 or later
```

Check versions:

```bash
docker compose version
docker buildx version
```

The environment originally had:

```text
Docker Compose: v5.4.0
Buildx:         0.12.1
```

Buildx was manually upgraded.

The Docker CLI plugin directory used was:

```text
/usr/libexec/docker/cli-plugins/
```

Verify:

```bash
ls -la /usr/libexec/docker/cli-plugins/
```

Install the ARM64 Buildx binary there:

```bash
sudo curl -L \
  https://github.com/docker/buildx/releases/download/v0.36.1/buildx-v0.36.1.linux-arm64 \
  -o /usr/libexec/docker/cli-plugins/docker-buildx

sudo chmod +x /usr/libexec/docker/cli-plugins/docker-buildx
```

Verify:

```bash
docker buildx version
```

The important requirement is Buildx >= 0.17.0.

---

# 4. Install Git

Install Git on the EC2 instance:

```bash
sudo dnf install git
```

Verify:

```bash
git --version
```

---

# 5. Clone the API Repository

Create the application directory:

```bash
sudo mkdir -p /opt/inkspire
```

Create the repository directory and clone the API repository:

```bash
cd /opt/inkspire
git clone <API_REPOSITORY_URL> blog-api
cd /opt/inkspire/blog-api
```

The resulting structure is approximately:

```text
/opt/inkspire/blog-api
├── compose.yaml
├── Dockerfile
├── package.json
├── prisma/
├── nginx/
└── ...
```

Give the Session Manager user ownership if needed:

```bash
sudo chown -R ssm-user:ssm-user /opt/inkspire
```

---

# 6. Create the Production Environment File

Create the Docker environment file:

```bash
cd /opt/inkspire/blog-api
vim .env.docker
```

The file contains the production values required by the API.

Important database configuration:

```env
DATABASE_URL=postgresql://blog_admin:<PASSWORD>@db:5432/blog_db
```

The hostname is:

```text
db
```

because `db` is the Docker Compose service name.

---

# 7. Nginx

Nginx runs as a Docker container rather than being installed directly on Amazon Linux.

Create:

```bash
mkdir -p nginx/conf.d
```

Configuration:

```text
/opt/inkspire/blog-api/nginx/conf.d/default.conf
```

Basic reverse proxy configuration:

```nginx
server {
    listen 80;
    server_name api.inkspire.fullstackprojects.dev;

    location / {
        proxy_pass http://api:4000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

# 8. Start the Application

From:

```bash
cd /opt/inkspire/blog-api
```

Start Compose:

```bash
docker compose up -d
```

Check:

```bash
docker compose ps
```

Check API logs:

```bash
docker compose logs api
```

Expected application output included:

```text
Connecting to Redis...
[redis] connected
API running on port 4000
```

Check Nginx:

```bash
docker compose logs nginx
```

---

# 9. Database Migrations and Seeding

The production image is intentionally kept focused on running the application.

The Prisma seed depends on development tooling/source code, so migrations/seeding were performed from the local development environment rather than adding development dependencies and source files to the production image.

For this one-time database initialization, PostgreSQL was temporarily exposed from EC2.

Temporary Compose configuration:

```yaml
db:
  ports:
    - "5432:5432"
```

Temporarily add a Security Group rule:

```text
TCP 5432
Source: <YOUR_PUBLIC_IP>/32
```

Do NOT use:

```text
0.0.0.0/0
```

The local Prisma environment was temporarily pointed at:

```env
DATABASE_URL=postgresql://blog_admin:<PASSWORD>@<EC2_ELASTIC_IP>:5432/blog_db
```

From the local API repository:

```bash
npx prisma migrate deploy
npx prisma db seed
```

After migrations and seeding:

1. Remove the temporary Security Group rule.
2. Remove the PostgreSQL `5432` port mapping from Compose.
3. Recreate/restart the database service.

The final production state does not expose PostgreSQL publicly.

---

# 10. Verify API Before HTTPS

The API was first tested directly through the EC2 public IP.

The API returned the expected seeded data, confirming:

- EC2 networking works.
- Docker networking works.
- Nginx/API setup works.
- PostgreSQL works.
- Redis works.
- Seed data is present.

---

# 11. Route 53 API Record

Create an A record in the Route 53 hosted zone:

```text
Name:
api.inkspire.fullstackprojects.dev

Type:
A

Value:
<EC2 ELASTIC IP>
```

Verify DNS:

```bash
dig +short api.inkspire.fullstackprojects.dev
```

It should return the Elastic IP.

---

# 12. Frontend: S3 + CloudFront

The frontend is hosted separately from EC2.

Architecture:

```text
React build
    ↓
S3
    ↓
CloudFront
    ↓
inkspire.fullstackprojects.dev
```

S3 with Cloudfront is also used for media uploads.

The S3 bucket should remain private with CloudFront Origin Access Control (OAC) used for CloudFront-to-S3 access.

---

# 13. CloudFront Custom Domain

For a custom CloudFront domain:

```text
inkspire.fullstackprojects.dev
```

Add - Alternate domain names (CNAMEs) to cloudfront settings

Use an ACM certificate in:

```text
us-east-1
```

for the CloudFront custom domain.

Then create a Route 53 alias A record pointing to the CloudFront distribution.

---

# 14. API HTTPS with Nginx + Let's Encrypt

Because there is no ALB in the cost-optimized architecture, API TLS is terminated by Nginx using a Let's Encrypt certificate.

Architecture:

```text
Browser
   ↓ HTTPS :443
api.inkspire.fullstackprojects.dev
   ↓
EC2
   ↓
Nginx :443
   ↓ HTTP
api:4000
```

Create certificate storage:

```bash
mkdir -p nginx/certbot/conf
mkdir -p nginx/certbot/www
```

Nginx mounts:

```text
./nginx/certbot/www  → /var/www/certbot
./nginx/certbot/conf → /etc/letsencrypt
```

During certificate issuance, Nginx serves the ACME challenge:

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}
```

Certbot is run as a Docker container:

```bash
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email ayush@fullstackprojects.dev \
  --agree-tos \
  --no-eff-email \
  -d api.inkspire.fullstackprojects.dev
```

After successful issuance, configure Nginx:

```nginx
server {
    listen 80;
    server_name api.inkspire.fullstackprojects.dev;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.inkspire.fullstackprojects.dev;

    ssl_certificate /etc/letsencrypt/live/api.inkspire.fullstackprojects.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.inkspire.fullstackprojects.dev/privkey.pem;

    location / {
        proxy_pass http://api:4000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Test the Nginx configuration:

```bash
docker compose exec nginx nginx -t
```

Reload:

```bash
docker compose exec nginx nginx -s reload
```

The final API URL is:

```text
https://api.inkspire.fullstackprojects.dev
```

---

# 15. Let's Encrypt Renewal

Certificates need renewal.

Test renewal:

```bash
docker compose run --rm certbot renew --dry-run
```

create a simple renewal script
```bash
vim renew-cert.sh

    #!/bin/bash
    set -euo pipefail

    cd /opt/inkspire/blog-api

    docker compose run --rm certbot renew -q && docker compose exec nginx nginx -s reload

sudo chmod +x /opt/inkspire/blog-api/nginx/renew-cert.sh
```

```bash
SLEEPTIME=$(awk 'BEGIN{srand(); print int(rand()*(3600+1))}')

echo "0 0,12 * * * root sleep $SLEEPTIME && /opt/inkspire/blog-api/nginx/renew-cert.sh" | sudo tee -a /etc/crontab
```

The certificate files are persisted under:

```text
nginx/certbot/conf/
```

---

# 21. Useful Commands

### Check containers

```bash
docker compose ps
```

### Logs

```bash
docker compose logs api
docker compose logs worker
docker compose logs nginx
docker compose logs db
docker compose logs redis
```

Follow logs:

```bash
docker compose logs -f api
```

### Restart everything

```bash
docker compose restart
```

### Rebuild after pulling code

```bash
git pull
docker compose build
docker compose up -d
```

### Stop

```bash
docker compose down
```

### Check Nginx config

```bash
docker compose exec nginx nginx -t
```

### Reload Nginx

```bash
docker compose exec nginx nginx -s reload
```

### Check Docker networks

```bash
docker network ls
```

### Shell into API

```bash
docker compose exec api sh
```

### Shell into PostgreSQL

```bash
docker compose exec db psql -U blog_admin -d blog_db
```

---