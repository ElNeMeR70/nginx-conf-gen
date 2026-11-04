#!/usr/bin/env node
const domain = process.argv[2] || "example.com";
const upstreamPort = parseInt(process.argv[3], 10) || 3000;
if (domain === "-h" || domain === "--help") {
  console.log("Usage: nginx-conf-gen [domain] [upstream-port]");
  console.log("Example: nginx-conf-gen api.mysite.com 4000");
  process.exit(0);
}
const conf = `server {
    listen 80;
    server_name ${domain};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:${upstreamPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}`;
console.log(conf.trim());
