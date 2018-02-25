"use strict";

import * as express from 'express';
import BookDir from '../biz/bookDir';
import Reading from '../biz/reading';
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
        let bookNum = BookDir.getInstance().bookNum;
        let contents = { isStillLoading, bookNum } as IStatus;
        responsejson(res, contents);
    });

    router.get("/do/refresh", async (req, res, next) => {
        console.info("GET /api/do/refresh");

        // コンテンツフォルダ以下のディレクトリを再帰的にチェックし、bookのリストを作る
        let bookDir = BookDir.getInstance();
        try {
            if (bookDir.isStillLoading()) {
                await bookDir.waitLoading(); //再取得はしない
            } else {
                await bookDir.detectBooks();
            }
            let books = bookDir.getBookList();
            responsejson(res, { list: books });
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });

    router.get("/books", async (req, res, next) => {
        console.info("GET /api/books");

        let bookDir = BookDir.getInstance();
        try {
            if (bookDir.isStillLoading()) {
                console.log("isStillLoading");
                await bookDir.waitLoading();
            }
            let books = bookDir.getBookList();
            responsejson(res, { list: books });
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });
    router.get("/books/:id", async (req, res, next) => {
        let bookId = req.params.id;
        console.info(`GET /api/books/${bookId}`);

        let bookDir = BookDir.getInstance();
        try {
            if (bookDir.isStillLoading()) {
                await bookDir.waitLoading();
            }
            let book = bookDir.getBook(bookId);
            if (!book) {
                console.error("book is not found");
                res.sendStatus(500).end();
                return;
            }
            await book.loadPageBody(); //画像データをロード
            Reading.getInstance().currentBook = book;
            responsejson(res, book);
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
            let book = Reading.getInstance().currentBook;
            // TODO: bookIdのチェック
            let page = book.getPageImage(pageIndex);
            responsejson(res, page);
        } catch(ex) {
            console.error(ex);
            res.sendStatus(500).end();
        }
    });

    
    return router;
};