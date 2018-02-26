# local-ebook-viwer

image file viwer.

## run in local pc (develop)

config `.env` file

```sh
export PORT=58080
export CONTENST_ROOT=/path/to/documents/root
export FE_PORT=4000
```

```sh
# run backend in console 1
$ npm run dev:backend

# run frontend(with webpack dev server) in console 2
$ npm run dev:frontend
```

open [http://localhost:4000/](http://localhost:4000/)

## run in local pc (production build)

config `.env` file

```sh
export PORT=58080
export CONTENST_ROOT=/path/to/documents/root
```

```sh
# build and run all
$ npm run build
$ npm run start_withenv
```

open [http://localhost:58080/](http://localhost:58080/)


## docker-compose.yml

```yaml
version: '2'
services:
  node_express:
    build: ./
    container_name: file_player
    volumes:
      - "${CONTENST_ROOT}:/contents"
    ports:
      - "${PORT}:80"
```