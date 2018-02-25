
import BookModel from './bookModel';

export default class Reading {
    private static _instance: Reading;

    private _book: BookModel | null = null;
    currentPageIndex: number = 0;

    private constructor() {
        
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new Reading();
        }
        return this._instance;
    }

    set currentBook(value:BookModel) {
        this._book = value;
        this.currentPageIndex = 0; //リセット
    }
    get currentBook(): BookModel {
        if (!this._book) throw new Error("invalid operation");
        return this._book;
    }
}