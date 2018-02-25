"use strict";

import * as express from 'express';
import * as path from 'path';

/** Api Controller */
export default function IndexController(clientDir: string):any {
    let router = express.Router();

    router.get("/", (req, res, next) => {
        console.log("clientDir: ", clientDir);
        res.sendFile(path.join(clientDir, "index.html"));
    });
    router.all("/index.html", (req, res, next) => {
        res.redirect("/");
    });
    return router;
};