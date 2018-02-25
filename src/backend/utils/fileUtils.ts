
import * as fs from 'fs';
import * as path from 'path';
import * as ReadChunk from 'read-chunk';
import * as FileType from 'file-type';
import {promisify} from 'util';

const stat = promisify(fs.stat);

export class FileInfoItem {
    filepath: string;
    name: string;
    isDirecotry: boolean;
    birthTimeMs: number;
    accessTimeMs: number; //最終アクセス時刻 (access time)
    modifyTimeMs: number; //最終変更時刻 (modify time)
    ext?: string;
    mime?: string;
}

export async function getFileInfo(filepath:string): Promise<FileInfoItem> {
    let res = new FileInfoItem();
    res.filepath = filepath;

    let filename = path.basename(filepath);
    res.name = filename;

    // ファイル情報の取得
    const st = await stat(filepath);
    res.isDirecotry = st.isDirectory();
    res.birthTimeMs = st.birthtimeMs;
    res.accessTimeMs = st.atimeMs;
    res.modifyTimeMs = st.mtimeMs;

    // mimetypeの取得
    const buffer = ReadChunk.sync(filepath, 0, 4100);
    let typeinfo = FileType(buffer);
    if (typeinfo == null) {
        console.log(filename, typeinfo);
        return res;
    }
    //=> {ext: 'png', mime: 'image/png'}
    res.ext = typeinfo.ext;
    res.mime = typeinfo.mime;
    return res;
}

export function mimeIsImage(mime:string): boolean {
    let imgMimes = ["image/png", "image/jpeg", "image/bmp"];
    for (let im of imgMimes) {
        if (mime == im) {
            return true;
        } 
    }
    return false;
}