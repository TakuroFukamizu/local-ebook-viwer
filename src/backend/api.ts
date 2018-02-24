"use strict";

import * as express from 'express';

/** Api Controller */
export default function ApiController(files: Array<string>):any {
    let router = express.Router();

    router.get("/api/books", async (req, res, next) => {
        // TODO: ルートフォルダ以下のディレクトリを再帰的にチェックし、bookのリストを作る
        res.json({ list: files } );
    });
    return router;
};