import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';
import {getFileInfo, mimeIsImage, FileInfoItem} from '../utils/fileUtils';
import {promisify} from 'util';
// import {IBookListEntry} from '../../common/apiInterface';
import BookModel from './bookModel';
import Store from './store';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

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

    // get bookNum():number {
    //     return this._files.length;
    // }

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

    async detectBooks(target:string|null=null, needRefresh:boolean=true): Promise<void> {
        let targetPath = target ? target : this._path;
        console.info('detectBooks', targetPath);

        if (this._loading) return Promise.reject(new Error("loading"));

        this._loading = true;
        if (needRefresh) this._files = [];
        let status = false;
        try {
            await this._proc(targetPath, needRefresh);
            this._loading = false;
            status = true;
        } catch(ex) {
            throw ex;
        } finally {
            console.info('detectBooks', 'finished');
            this.emit(BookDir.EVENT_LOAD_FINISHED, status);
        }
    }


    async _proc(currentDir:string, needRefresh:boolean): Promise<void> {
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
        let metaFilePath: string | null = null;
        let hasHtml = false;
        for(let f of files) {
            let filepath = path.join(currentDir, f);
            let fileinfo = await getFileInfo(filepath);

            if (fileinfo.isDirecotry) {
                dirs.push(filepath);
            } else if (path.extname(f) == '.html' || path.extname(f) == '.htm') {
                hasHtml = true;
                // continue;
                break;
            } else if (f == 'meta.json') {
                metaFilePath = filepath;
                continue;
            } else if (fileinfo.mime == null || !mimeIsImage(fileinfo.mime)) {
                console.log('unhandled type: ', fileinfo.mime, fileinfo.name);
                continue;
            } else {
                images.push(fileinfo);
            }
        }
        // 重複スキップ(on memory)
        if (!needRefresh) { // TODO: bookフォルダ自体がネストする場合はこれ修正必要
            let exist = false;
            for (let f of this._files) {
                if (currentDir == f.dirpath) {
                    exist = true;
                    break;
                }
            }
            if (exist) return; //スキップ
        }
        // bookフォルダ or 親フォルダ
        if (hasHtml) { //現状、htmlフォルダーは対応しない
            return;
        }
        if (images.length >= 3) { //画像が3枚以上ある
            console.log(images.length, 'image detected', currentDir);
            let entry = new BookModel(currentDir);
            
            if (metaFilePath) {
                // FIXME: meta.jsonを読み込んでDBに保存
                const metaObj = JSON.parse(await readFile(metaFilePath, 'utf8'));
                console.log(metaObj.distribution_title, metaObj.distribution_url, metaObj.private.comment, metaObj.private['tag-list']);
                if (metaObj.private['tag-list']) { 
                    entry.tags = metaObj.private['tag-list'].map((v: any) => v.title);
                    entry.tagsAll = entry.tags.join(',');
                }
                if (metaObj.private['comment']) { 
                    entry.comment = metaObj.private.comment;
                }
            }

            let bookIsExist = await Store.isBookExist(entry);
            // TODO: 内容の差分確認
            if (!bookIsExist) { //DBに存在しない場合は取得 
                await entry.addImages(images);
                entry.makeNewId();
                await Store.addBook(entry.rawValue);
            } else { 
                const book = await Store.getBookByDirpath(entry.dirpath);
                if (metaFilePath) {
                    book.tags = entry.tags;
                    book.tagsAll = entry.tagsAll;
                    book.comment = entry.comment;
                }
                await Store.updateBook(book);
            }
            this._files.push(entry);
            return;
        } else {
            // サブディレクトリを再帰で解析
            return Promise.all(dirs.map((d) => this._proc(d, needRefresh))).then(() => { return });
        }
    }

    // getBookList(): Array<IBookListEntry> {
    //     return this._files.map((b) => {
    //         return {
    //             id: b.id,
    //             title: b.title,
    //             dirpath: b.dirpath,
    //             dirname: b.dirname,
    //             thumbnail: b.thumbnail,
    //             pageNum: b.pageNum,
    //             birthTimeMs: b.birthTimeMs,
    //             accessTimeMs: b.accessTimeMs,
    //             modifyTimeMs: b.modifyTimeMs
    //         } as IBookListEntry;
    //     });
    // }

    // getBook(bookId:string): BookModel | null {
    //     let file =  this._files.filter((f) => f.id == bookId); //uuidに変更
    //     if (file.length == 0) return null;
    //     return file[0];
    // }
}