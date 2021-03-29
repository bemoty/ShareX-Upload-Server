# Bemoty's ShareS server

This repository contains my personal fork of the [ShareX-Upload-Server (ShareS)](https://github.com/TannerReynolds/ShareX-Upload-Server) by [TannerReynolds](https://github.com/TannerReynolds). I use it to upload screenshots to my domain i.bemoty.dev. If you want to find out more about the original ShareS server, you might want to check out the [upstream readme](https://github.com/TannerReynolds/ShareX-Upload-Server/blob/master/README.md).

## Installation

Clone this repository.

```console
git clone https://github.com/bemoty/sharex-upload-server
```

Install dependencies.

```console
npm i
```

Change `src/config.debug.json` how you want and debug the application locally using `npm run debug`.

## Usage

The following setup is used together with a [nginx reverse proxy](https://github.com/nginx-proxy/nginx-proxy) (running in the "bemoty" network). The nginx reverse proxy handles HTTPS using the [docker-nginx-lets-encrypt-companion](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion), which is why any SSL functionality is removed from this fork.

You will need to login to the GitHub Package Registry before you can use this image. Simply create a personal access token [here](https://github.com/settings/tokens) and login with it using `docker login https://docker.pkg.github.com -u <username> -p <access token>`.

```yml
version: '2'

services:
  sharex:
    container_name: sharex
    image: docker.pkg.github.com/bemoty/sharex-upload-server/server:latest
    volumes:
      - ./volumes/uploads:/home/sharex/server/uploads
      - ./volumes/config.json:/home/sharex/config.json
      - ./volumes/db.json:/home/sharex/db.json
    ports:
      - '8001:80'
    environment:
      VIRTUAL_HOST: i.bemoty.dev
      LETSENCRYPT_HOST: i.bemoty.dev
    networks:
       - bemoty

networks:
  bemoty:
    external: true
```

If you want to automatically pull updates from the registry, I recommend using [watchtower](https://github.com/containrrr/watchtower). Watchtower also needs to know your GitHub username and personal access token in order to access GitHub Package Registry. Use environment variables `REPO_USER` and `REPO_PASS` to inform watchtower about these parameters.

```
  watchtower:
    image: containrrr/watchtower
    container_name: sharex_watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 30 sharex
```

## License

This project is licensed under the [GNU General Public License v3.0](https://choosealicense.com/licenses/gpl-3.0/).