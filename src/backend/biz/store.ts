import * as Datastore from 'nedb';
import * as path from 'path';
import BookModel from './bookModel';
import {IBookEntry, IBookListEntry, IPageEntry} from '../../common/apiInterface';

interface IPageDbEntry { 
    bookId: string;
    pageIndex: number;
    page: IPageEntry;
}

class Store {
    dbdir: string = './';
    private _catalogDB: Datastore;
    private _imageCacheDB: Datastore;

    init() { 
        this._catalogDB = new Datastore({ 
            filename: path.join(this.dbdir,'catalog.db'),
            autoload: true
        });
        this._imageCacheDB = new Datastore({ 
            filename: path.join(this.dbdir,'imageCache.db'),
            autoload: true
        });
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

    addBook(doc: IBookEntry) {
        return new Promise((resolve, reject) => {
            this._catalogDB.insert(doc, (err, newDoc:IBookEntry) => { 
                if (err) reject(err);
                resolve(newDoc);
            });
        });
    }

    allBooks(): Promise<IBookEntry[]> {
        return new Promise((resolve, reject) => {
            this._catalogDB.find({}, (err:Error, docs:IBookEntry[]) => {
                if (err) reject(err);
                resolve(docs);
            });
        });
    }

    async getBookList(): Promise<IBookListEntry[]> {
        let books = await this.allBooks();
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
                modifyTimeMs: b.modifyTimeMs
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