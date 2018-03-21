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
export WORKFILE_DIR=/path/to/workfile/dir
```

```sh
# build and run all
$ npm run build
$ npm run start_withenv
```

open [http://localhost:58080/](http://localhost:58080/)


## run on docker

config `.env` file

```sh
PORT=58080
CONTENST_ROOT=/path/to/documents/root
WORKFILE_DIR=/path/to/workfile/dir
```

config `docker-compose.yml` file

```yaml
version: '3'
services:
  node_express:
    build: ./
    container_name: ebook
    volumes:
      - "${CONTENST_ROOT}:/app/contents"
      - "${WORKFILE_DIR}:/app/workdir"
    ports:
      - "${PORT}:80"
```

start with docker-compose  

```sh
$ docker-compose up
```