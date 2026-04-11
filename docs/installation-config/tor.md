---
title: Usage over Tor
parent: Installation and configuration
nav_order: 2
---

# Usage over Tor

If you want to use this project over Tor and serve PanoptiCity as a .onion website, it is possible quite easily. This however requires to modify manually some files.

To do so you'll need to follow thoses steps:

**Create a torrc file**

At the root of the project, create a file named `torrc` containing those lines:

```
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 nginx:80
```

**Update docker-compose**

In your docker-compose file, add a new service dedicated to serve the website. Modify the yml file to add those lines:

```
  tor:
    image: alpine:latest
    container_name: tor
    restart: unless-stopped
    depends_on:
      - nginx
    volumes:
      - ./tor-data:/var/lib/tor/hidden_service
      - ./torrc:/etc/tor/torrc:ro
    command: >
      sh -c "apk add --no-cache tor su-exec &&
             chown -R tor:tor /var/lib/tor &&
             chmod 700 /var/lib/tor &&
             chmod 700 /var/lib/tor/hidden_service &&
             exec su-exec tor tor -f /etc/tor/torrc"
```

In the nginx service of you should also add a new environment variable :

```
    - ONION_ADDRESS=${ONION_ADDRESS}
```

**Launch your stack to generate a .onion address**

Run `docker compose up tor` to create a .onion address that you'll get by running `cat tor-data/hostname` (might need to be sudo).

**Modify your .env file to add this new address**

Add a new line to your `.env` file with this new domain:

```
ONION_ADDRESS=mynewsuperaddressavailableontornetworkonlyformoreprivacy.onion
```

**Update your nginx configuration**

Add those lines at the end of your `nginx.conf.template` file:

```
# --------- TOR SETTINGS -------------

server {
    listen 80;
    server_name ${ONION_ADDRESS};

    # --- Backend / API Logic ---
    location /api/cameras {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin * always;
    }

    location /api/focus {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin * always;
    }

    location /api {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }

    # --- Frontend Logic ---
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Note that for Tor we don't use any cache to serve the data. The default layer for the map is the humanitarian layer because the basic one is not served will by OSM (see [blocked tiles](https://wiki.openstreetmap.org/wiki/Blocked_tiles)).

**Update allowed hosts for the backend**

Manually modify the file `back-end/panopticity/settings.py` to change the line containing `ALLOWED_HOSTS` and replace it with your backend address and your new onion address.

This should look like this :

```
ALLOWED_HOSTS = ['api.panopticity.fr', 'mynewsuperaddressavailableontornetworkonlyformoreprivacy.onion']
```

**Confirm everything is running**

Run your project (`docker compose up -d`) and verify everything is working both with your classic address and on Tor with your new .onion address.
If you encounter any issue create a ticket on Github with the docker logs.
