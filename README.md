# file-player

image file viwer.

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