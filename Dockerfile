FROM node:8.9

RUN mkdir -p /contents
RUN mkdir -p /source

ENV PORT=80
ENV CONTENST_ROOT=/contents 

EXPOSE 80
VOLUME ["/contents"]

ADD package.json /source/
ADD src /source/
ADD webpack.config.js /source/

WORKDIR /source
RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]