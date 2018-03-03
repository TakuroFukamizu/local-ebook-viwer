FROM node:8.9

RUN mkdir -p /app/source
RUN mkdir -p /app/contents
RUN mkdir -p /app/workdir

ENV PORT=80
ENV CONTENST_ROOT=/app/contents
ENV WORKFILE_DIR=/app/workdir

EXPOSE 80
VOLUME ["/app/contents"]
VOLUME ["/app/workdir"]

ADD package.json /app/source/
ADD src /app/source/
ADD webpack.config.js /app/source/

WORKDIR /app/source
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]