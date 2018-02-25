import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';
import {getFileInfo, mimeIsImage, FileInfoItem} from '../utils/fileUtils';
import {promisify} from 'util';
import {IBookListEntry} from '../../common/apiInterface';
import BookModel from './bookModel';

const readdir = promisify(fs.readdir);


export default class BookDir extends events.EventEmitter {
    private static _instance: BookDir;

    private _path: string = '';
    private _files: Array<BookModel> = [];
    private _loading = false;

    private _ignoreFiles = [ ".DS_Store" ];

    static EVENT_LOAD_FINISHED = Symbol('loadFinished');

    private constructor() {
        super();
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new BookDir();
        }
        return this._instance;
    }

    setPath(path:string) {
        this._path = path;
    }

    get bookNum():number {
        return this._files.length;
    }

    isStillLoading() {
        return this._loading;
    }

    async waitLoading(): Promise<any> {
        if (!this.isStillLoading()) return Promise.resolve();
        return new Promise((resolve, reject) => {
            this.on(BookDir.EVENT_LOAD_FINISHED, (status:boolean) => {
                if (!status) reject();
                resolve();
            });
        });
    }

    async detectBooks(target:string|null=null): Promise<void> {
        let targetPath = target ? target : this._path;
        console.info('detectBooks', targetPath);

        if (this._loading) return Promise.reject(new Error("loading"));

        this._loading = true;
        this._files = [];
        let status = false;
        try {
            await this._proc(targetPath);
            for(let b of this._files) {
                b.makeNewId(); // TODO: DBと照合し、重複なきものだけやる
            }
            this._loading = false;
            status = true;
        } catch(ex) {
            throw ex;
        } finally {
            console.info('detectBooks', 'finished');
            this.emit(BookDir.EVENT_LOAD_FINISHED, status);
        }
    }


    async _proc(currentDir:string): Promise<void> {
        console.log('_proc', currentDir);
        // ディレクトリの内容確認
        let files = await readdir(currentDir);
        files = files.filter((f) => {
            for(let i of this._ignoreFiles) {
                if (i == f) return false;
            }
            return true;
        })
        let dirs: Array<string> = [];
        let images: Array<FileInfoItem> = [];
        let hasHtml = false;
        for(let f of files) {
            let filepath = path.join(currentDir, f);
            let fileinfo = await getFileInfo(filepath);

            if (fileinfo.isDirecotry) {
                dirs.push(filepath);
            } else if(path.extname(f) == '.html' || path.extname(f) == '.htm') {
                hasHtml = true;
                // continue;
                break;
            } else if (fileinfo.mime == null || !mimeIsImage(fileinfo.mime)) {
                console.log(fileinfo.mime, fileinfo.name);
                continue;
            } else {
                images.push(fileinfo);
            }
        }
        // bookフォルダ or 親フォルダ
        if (hasHtml) { //現状、htmlフォルダーは対応しない
            return;
        }
        if (images.length >= 3) { //画像が3枚以上ある
            console.log(images.length, 'image detected', currentDir);
            let entry = new BookModel(currentDir);
            await entry.addImages(images);
            this._files.push(entry);
            return;
        } else {
            // サブディレクトリを再帰で解析
            return Promise.all(dirs.map((d) => this._proc(d))).then(() => { return });
        }
    }

    getBookList(): Array<IBookListEntry> {
        return this._files.map((b) => {
            return {
                id: b.id,
                title: b.title,
                dirpath: b.dirpath,
                dirname: b.dirname,
                thumbnail: b.thumbnail,
                pageNum: b.pageNum,
                birthTimeMs: b.birthTimeMs,
                accessTimeMs: b.accessTimeMs,
                modifyTimeMs: b.modifyTimeMs
            } as IBookListEntry;
        });
    }

    getBook(bookId:string): BookModel | null {
        let file =  this._files.filter((f) => f.id == bookId); //uuidに変更
        if (file.length == 0) return null;
        return file[0];
    }
}