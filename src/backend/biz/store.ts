import * as Datastore from 'nedb';
import * as path from 'path';
import BookModel from './bookModel';
import {IBookEntry, IBookListEntry, IPageEntry} from '../../common/apiInterface';

interface IPageDbEntry { 
    bookId: string;
    pageIndex: number;
    page: IPageEntry;
}

export enum BookSortBy { Title, CreatedByDesc, ReadCountDesc };

class Store {
    dbdir: string = './';
    private _catalogDB: Datastore;
    private _imageCacheDB: Datastore;

    async init(): Promise<void> { 
        console.log("start load db");
        this._catalogDB = new Datastore({ 
            filename: path.join(this.dbdir,'catalog.db'),
            autoload: false
        });
        this._imageCacheDB = new Datastore({ 
            filename: path.join(this.dbdir,'imageCache.db'),
            autoload: false
        });

        // load
        await this.loadDb(this._catalogDB);
        await this.loadDb(this._imageCacheDB);
    }

    private async loadDb(db: Datastore): Promise<{}> { 
        return new Promise((resolve, reject) => {
            db.loadDatabase((err) => {
                if (err) reject(err);
                resolve();
            });
        })
    }

    
    isBookExist(doc: IBookEntry): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let condition = { dirpath: doc.dirpath };
            this._catalogDB.findOne(condition, (err, doc:IBookEntry|null) => {
                if (err) reject(err);
                if (doc == null) {
                    resolve(false);
                } else { 
                    resolve(true);
                }
            });
        });
    }

    /** 新しい本を追加する */
    addBook(doc: IBookEntry) {
        return new Promise((resolve, reject) => {
            this._catalogDB.insert(doc, (err, newDoc:IBookEntry) => { 
                if (err) reject(err);
                resolve(newDoc);
            });
        });
    }

    allBooks(start:number=0, limit:number=10, sortBy:BookSortBy=BookSortBy.Title, searchKeywrod:string|null=null): Promise<IBookEntry[]> {
        return new Promise((resolve, reject) => {
            let sortCondition;
            switch (sortBy) { 
                case BookSortBy.Title: sortCondition = { title: 1 }; break;
                case BookSortBy.CreatedByDesc: sortCondition = { birthTimeMs: -1 }; break;
                case BookSortBy.ReadCountDesc: sortCondition = { readCount: -1 }; break;
                default: sortCondition = { title: 1 }; break;
            }
            let searchCondition = {};
            if (searchKeywrod) { 
                searchCondition = {
                    $or: [
                        { title: searchKeywrod },
                        { dirname: searchKeywrod },
                        { tagsAll: searchKeywrod }
                    ]
                }
            }
            console.log('allBooks', sortCondition, start, limit);
            this._catalogDB.find(searchCondition).sort(sortCondition).skip(start).limit(limit).exec((err:Error, docs:IBookEntry[]) => {
                if (err) reject(err);
                console.log(docs.map((v) => { return { dirpath:v.dirpath, title:v.title, pageNum:v.pageNum, readCount:v.readCount, isBookmarked:v.isBookmarked } }));
                resolve(docs);
            });
        });
    }

    async getBookList(start:number=0, limit:number=10, sortBy:BookSortBy=BookSortBy.Title): Promise<IBookListEntry[]> {
        let books = await this.allBooks(start, limit, sortBy);
        return books.map((b) => {
            return {
                id: b.id,
                title: b.title,
                dirpath: b.dirpath,
                dirname: b.dirname,
                thumbnail: b.thumbnail,
                pageNum: b.pageNum,
                birthTimeMs: b.birthTimeMs,
                accessTimeMs: b.accessTimeMs,
                modifyTimeMs: b.modifyTimeMs,
                readCount: b.readCount || 0,
                isBookmarked: b.isBookmarked || false,
            } as IBookListEntry;
        });
    }

    getBook(bookId: string): Promise<BookModel> {
        return new Promise((resolve, reject) => {
            let condition = { id: bookId };
            this._catalogDB.findOne(condition, (err, doc:IBookEntry|null) => {
                if (err) reject(err);
                if (doc == null) {
                    // 見つからない
                    reject(new Error("book is not found"));
                } else { 
                    let book = new BookModel();
                    book.rawValue = doc;
                    resolve(book);
                }
            });
        });
    }

    getBookByDirpath(dirpath:string): Promise<BookModel> {
        return new Promise((resolve, reject) => {
            let condition = { dirpath: dirpath };
            this._catalogDB.findOne(condition, (err, doc:IBookEntry|null) => {
                if (err) reject(err);
                if (doc == null) {
                    // 見つからない
                    reject(new Error("book is not found"));
                } else { 
                    let book = new BookModel();
                    book.rawValue = doc;
                    resolve(book);
                }
            });
        });
    }

    /** 既存の本を更新する */
    updateBook(doc: IBookEntry) {
        console.log('updateBook', doc.dirpath, doc.readCount, doc.isBookmarked);
        return new Promise((resolve, reject) => {
            const condition = { id: doc.id };
            this._catalogDB.update(condition, { $set: doc }, { multi: true }, (err) => { 
                //err, numAffected, affectedDocuments, upsert
                if (err) reject(err);
                resolve();
            });
        });
    }

    /** 視聴回数を更新する */
    async setBookReadCount(bookId: string) { 
        const doc = await this.getBook(bookId);
        doc.upReadCount();
        await this.updateBook(doc);
    }

    getBookNum(): Promise<number> { 
        return new Promise((resolve, reject) => {
            this._catalogDB.count({}, (err, count) => {
                if (err) reject(err);
                resolve(count);
            });
        });
    }

    // ----------------------------------------------

    addPageImage(bookId: string, pageIndex: number, page: IPageEntry): Promise<IPageEntry> { 
        let doc: IPageDbEntry = {
            bookId,
            pageIndex,
            page
        };
        return new Promise((resolve, reject) => {
            this._imageCacheDB.insert(doc, (err, newDoc:IPageDbEntry) => { 
                if (err) reject(err);
                resolve(newDoc.page);
            });
        });
    }

    getPageImage(bookId: string, pageIndex: number): Promise<IPageEntry|null> {
        return new Promise((resolve, reject) => {
            let condition = { bookId, pageIndex };
            this._imageCacheDB.findOne(condition, (err, doc:IPageDbEntry|null) => {
                if (err) reject(err);
                if (doc == null) {
                    // 見つからない
                    resolve(null);
                } else { 
                    resolve(doc.page);
                }
            });
        });
    }

}

export default new Store();