import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';
import * as ReadChunk from 'read-chunk';
import * as FileType from 'file-type';

const DEF_INTERVAL = 10 * 1000; //10sec

/** 
 * Skill実装サンプル1 ディレクトリ監視 
 * 指定されたディレクトリにファイルが追加されたら連絡する
 */
export default class WatchDir extends events.EventEmitter {
    private _path: string;
    private _interval: number;
    private _watcherTimer: NodeJS.Timer;

    private _files: Array<string>;

    static EVENT_NEW_FILE = Symbol('new file');

    /**
     * コンストラクタ
     * @param path 監視対象のパス
     * @param interval 監視間隔(ms)
     */
    constructor(path: string, interval=DEF_INTERVAL) {
        super();
        this._path = path;
        this._interval = interval;
        this._files = [];
    }

    /** 監視開始 */
    start() {
        let proc = () => {
            fs.readdir(this._path, (err, files) => {
                files.filter((file) => this._files.indexOf(file) == -1 ).forEach((file) => {
                    //新しいファイル
                    console.log(`new file is detected: ${file}`);
                    this._files.push(file);
                    let fileinfo = this._getFileInfo(file);
                    this.emit(WatchDir.EVENT_NEW_FILE, fileinfo);
                });
                // 現状は増えたファイルのみチェック
            });
        };
        this._watcherTimer = setInterval(proc, this._interval);
        // proc(); //初回実行
    }

    stop() {
        clearInterval(this._watcherTimer);
    }

    private _getFileInfo(filepath:string): FileInfoItem {
        let filename = path.basename(filepath);
        const buffer = ReadChunk.sync(filepath, 0, 4100);
        let typeinfo = FileType(buffer);
        //=> {ext: 'png', mime: 'image/png'}
        let res = new FileInfoItem();
        res.filepath = filepath;
        res.name = filename;
        res.ext = typeinfo.ext;
        res.mime = typeinfo.mime;
        return res;
    }

    getFiles(): Array<string> {
        return this._files;
    }
}

class FileInfoItem {
    filepath: string;
    name: string;
    ext: string;
    mime: string;
}