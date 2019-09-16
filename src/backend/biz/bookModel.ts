import * as path from 'path';
import * as sharp from 'sharp';
import * as uuidv4 from 'uuid/v4';
import {FileInfoItem} from '../utils/fileUtils';
import {IBookEntry, IPageListEntry, IPageEntry} from '../../common/apiInterface';
import Store from './store';

const reFileNum = /\D*(\d*)\D*/;

export default class BookModel implements IBookEntry {
    id: string;
    dirpath: string = '';
    dirname: string = '';
    pages: IPageListEntry[] = [];
    tags: string[] = [];
    tagsAll: string = '';

    comment: string = '';
    readCount: number = 0;
    isBookmarked: boolean = false;

    targetThumbnailSize = 200;
    targetImageSize = 1024;

    private _images: string[] = [];

    constructor(dirpath?: string) {
        if (dirpath) { 
            this.dirpath = dirpath;
            this.dirname = path.basename(dirpath);
        }
    }

    get rawValue(): IBookEntry {
        let entry:IBookEntry = {
            id:this.id,
            title: this.title,
            dirpath: this.dirpath,
            dirname: this.dirname,
            thumbnail: this.thumbnail,
            pages: this.pages,
            pageNum: this.pageNum,
            tags: this.tags,
            tagsAll: this.tagsAll,
            birthTimeMs: this.birthTimeMs,
            accessTimeMs: this.accessTimeMs,
            modifyTimeMs: this.modifyTimeMs,
            comment: this.comment,
            readCount: this.readCount,
            isBookmarked: this.isBookmarked,
        }
        return entry;
    }
    set rawValue(value: IBookEntry) { 
        this.id = value.id;
        this.dirpath = value.dirpath;
        this.dirname = path.basename(this.dirpath);
        this.pages = value.pages;
        this.tags = value.tags;
        this.tagsAll = value.tagsAll;
        this.comment = value.comment;
        this.readCount = value.readCount;
        this.isBookmarked = value.isBookmarked;
    }

    makeNewId() {
        this.id = uuidv4();
    }

    get title():string {
        return this.dirname; //FIXME
    }

    get pageNum():number {
        return this.pages.length;
    }
    
    get birthTimeMs(): number {
        return this.pages[0].birthTimeMs;
    }

    get accessTimeMs(): number {
        return this.pages[0].accessTimeMs;
    }

    get modifyTimeMs(): number {
        return this.pages[0].modifyTimeMs;
    }

    get thumbnail():string {
        return this.pages[0].thumbnail; //FIXME
    }

    async addImages(imagePaths:Array<FileInfoItem>) {
        this.pages = [];
        this._images = [];
        for(let f of this._sortPage(imagePaths)) {
            let thumbnail = await this._createThumnail(f.filepath, f.mime||'');
            // let thumbnail = await this._createThumnail(f.filepath, f.mime||'', true);
            let entry = { 
                filepath:f.filepath, 
                name:f.name, 
                birthTimeMs:f.birthTimeMs,
                accessTimeMs:f.accessTimeMs,
                modifyTimeMs:f.modifyTimeMs,
                mime:f.mime, 
                thumbnail 
            } as IPageListEntry;
            this.pages.push(entry);
        }
    }

    /* 視聴回数をカウントアップ */
    upReadCount() { 
        if (!this.readCount) this.readCount = 0;
        this.readCount++;
    }

    private _sortPage(imagePaths:Array<FileInfoItem>) {
        return imagePaths.sort((a:FileInfoItem, b:FileInfoItem):number => {
            let aNum = this._getNumberByFilename(a.name);
            let bNum = this._getNumberByFilename(b.name);
            if( aNum < bNum ) return -1;
            if( aNum > bNum ) return 1;
            return 0;
        });
    }

    private async _createThumnail(filepath:string, mime:string, isSquare:boolean=false) {
        let imageBuffer = isSquare ? 
            await sharp(filepath).resize(this.targetThumbnailSize, this.targetThumbnailSize).crop(sharp.gravity.north).toBuffer()
            : 
            await sharp(filepath).resize(this.targetThumbnailSize).toBuffer();
        
        let thumbnail = `data:${mime};base64,${imageBuffer.toString('base64')}`;
        return thumbnail;
    }

    private async _createImageBody(filepath:string, mime:string) {
        let imageBuffer = await sharp(filepath).resize(this.targetImageSize).toBuffer();
        let data = `data:${mime};base64,${imageBuffer.toString('base64')}`;
        return data;
    }

    private _getNumberByFilename(name:string):number {
        let match = reFileNum.exec(name);
        if (!match) return Infinity;
        return parseInt(match[1], 10);
    }

    async loadPageBody() {
        this._images = [];
        for(let p of this.pages) {
            let data = await this._createImageBody(p.filepath, p.mime);
            this._images.push(data);
        }
    }

    getPageList():IPageListEntry[] {
        return this.pages;
    }

    async getPageImage(index:number):Promise<IPageEntry> {
        if (this.pages.length <= index) throw new Error("page not found");
        // let page = this.pages[index];
        let page = await Store.getPageImage(this.id, index);
        if (!page) { 
            let pl = this.pages[index];
            let data = await this._createImageBody(pl.filepath, pl.mime);
            page = { 
                filepath:pl.filepath, 
                name:pl.name, 
                birthTimeMs:pl.birthTimeMs,
                accessTimeMs:pl.accessTimeMs,
                modifyTimeMs:pl.modifyTimeMs,
                mime:pl.mime, 
                data 
            } as IPageEntry;
            Store.addPageImage(this.id, index, page);
        }
        // let data = this._images[index];
        // let entry = { 
        //     filepath:page.filepath, 
        //     name:page.name, 
        //     birthTimeMs:page.birthTimeMs,
        //     accessTimeMs:page.accessTimeMs,
        //     modifyTimeMs:page.modifyTimeMs,
        //     mime:page.mime, 
        //     data 
        // } as IPageEntry;
        // return entry;
        return page;
    }
}
