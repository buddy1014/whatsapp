### list of endpoints:

#### send message to whatsapp

- path: https://wa1.letsw.com/sendMessage/123/966581796666/test1

### Server Setup

#### install:

- curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
- sudo apt install nodejs

#### clone project from git

- cd /var/www
- git clone https://letsw@bitbucket.org/letsw/wa.git

#### generate token

- cd wa
- echo "TOKEN" > keys.txt

#### run server

- npm i
- npm install -g pm2
- pm2 startup systemd
- node add.js
- pm2 start server.config.js

#### server config

```
nginx:
server {
listen 80;
listen [::]:80 ;
listen 443 ssl http2;
listen [::]:443 ssl http2 ;

root /var/www/wa;

    index index.js ;

    server_name wa1.letsw.com;

    location / {
        # rewrite /api/(.*) /$1  break;
        proxy_redirect off;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}

```

#### restart server

- service nginx restart
