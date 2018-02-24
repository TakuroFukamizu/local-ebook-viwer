// import * as cors from 'cors';
import * as express from 'express';
import ApiController from './api';
import WatchDir from './watchDir';

const port = process.env.PORT || 80;
const clientDir = process.env.CLIENT_DIR || "./client";

let files: Array<string> = [];

let app = express();

app.use(ApiController(files));
app.use(express.static(clientDir));

app.listen(port);

const skillWatchDir = new WatchDir('/home/pi/testdir'); //ホームディレクトリ直下のtestdirを監視
skillWatchDir.on(WatchDir.EVENT_NEW_FILE, (file) => {
    console.log(file);
    // let payload = {
    //     name: file.name,
    //     filepath: file.filepath,
    //     ext: file.ext,
    //     mime: file.mime
    // };
    files = skillWatchDir.getFiles();
});

