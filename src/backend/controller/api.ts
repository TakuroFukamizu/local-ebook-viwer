"use strict";

import * as express from 'express';
import BookDir from '../biz/bookDir';
import Store from '../biz/store';
// import Reading from '../biz/reading';
import {IStatus} from '../../common/apiInterface';

/** Api Controller */
export default function ApiController():any {
    let router = express.Router();

    function responsejson(res:express.Response, contents:any) {
        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(contents);
    }

    router.get("/status", async (req, res, next) => {
        let isStillLoading = BookDir.getInstance().isStillLoading();
        // let bookNum = BookDir.getInstance().bookNum;
        let bookNum = await Store.getBookNum();
        let contents = { isStillLoading, bookNum } as IStatus;
        responsejson(res, contents);
    });

    router.get("/do/refresh", async (req, res, next) => {
        let limit = parseInt(req.query.limit) || 10;
        console.info(`GET /api/do/refresh: ${limit}`);

        // コンテンツフォルダ以下のディレクトリを再帰的にチェックし、bookのリストを作る
        let bookDir = BookDir.getInstance();
        try {
            if (bookDir.isStillLoading()) {
                await bookDir.waitLoading(); //再取得はしない
            } else {
                await bookDir.detectBooks(null, false); //api呼び出しの場合は洗い替えをしない
                // TODO: オプション対応
            }
            // let books = bookDir.getBookList();
            let books = await Store.getBookList(0, limit);
            responsejson(res, { list: books });
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });

    router.get("/books", async (req, res, next) => {
        let start = parseInt(req.query.start) || 0;
        let limit = parseInt(req.query.limit) || 10;
        console.info(`GET /api/books: ${start}, ${limit}`);

        let bookDir = BookDir.getInstance();
        try {
            if (bookDir.isStillLoading()) {
                console.log("isStillLoading");
                await bookDir.waitLoading();
            }
            // let books = bookDir.getBookList();
            let books = await Store.getBookList(start, limit);
            responsejson(res, { list: books });
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });
    router.get("/books/:id", async (req, res, next) => {
        let bookId = req.params.id;
        console.info(`GET /api/books/${bookId}`);

        try {
            let book = await Store.getBook(bookId);
            if (!book) {
                console.error("book is not found");
                res.sendStatus(500).end();
                return;
            }
            if (book.pageNum > 3) { //先頭ページを事前ロード
                await book.getPageImage(0);
            }
            // await book.loadPageBody(); //画像データをロード
            // Reading.getInstance().currentBook = book;
            responsejson(res, book.rawValue);
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });


    router.get("/books/:id/pages/:index", async (req, res, next) => {
        let bookId = req.params.id;
        let pageIndex = req.params.index;
        console.info(`GET /api/books/${bookId}/pages/${pageIndex}`);

        try {
            // let book = Reading.getInstance().currentBook;
            // TODO: bookIdのチェック
            let book = await Store.getBook(bookId);
            let page = await book.getPageImage(pageIndex);
            responsejson(res, page);
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });

    
    return router;
};