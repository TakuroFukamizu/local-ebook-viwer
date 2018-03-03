// import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import ApiController from './controller/api';
import IndexController from './controller/indexPage';
import BookDir from './biz/bookDir';
import * as cors from 'cors';
import Store from './biz/store';

if (process.env.CONTENST_ROOT == undefined) throw new Error("CONTENST_ROOT is empty");

const port = process.env.PORT || 80;
const clientDir = process.env.CLIENT_DIR || path.resolve(__dirname, '../client');
const contetnsDir = process.env.CONTENST_ROOT || './';
const workfileDir = process.env.WORKFILE_DIR || './work';


let app = express();
app.use(cors());
app.use('/api', ApiController());
app.use('/static', express.static(clientDir));
app.use('/', IndexController(clientDir));

const server = app.listen(port, () => {
    console.info(`Node.js is listening to PORT: ${server.address().port}`);
});

Store.dbdir = path.join(workfileDir, 'db');
Store.init();

let bookDir = BookDir.getInstance();
bookDir.setPath(contetnsDir);
bookDir.detectBooks().then(async () => {
    // console.info(`book entory is loaded : ${bookDir.getBookList().length}`);
    console.info(`book entory is loaded : ${await Store.getBookNum()}`);
});
// const skillWatchDir = new WatchDir(contetnsDir);
// skillWatchDir.on(WatchDir.EVENT_NEW_FILE, (file) => {
//     console.log(file);
//     // let payload = {
//     //     name: file.name,
//     //     filepath: file.filepath,
//     //     ext: file.ext,
//     //     mime: file.mime
//     // };
//     files = skillWatchDir.getFiles();
// });

