import axios, {AxiosInstance} from 'axios';
import {IBookEntry, IPageEntry, IBookListEntry, IStatus} from '../../common/apiInterface';

interface axiosConfig {
    baseURL?: string;
    method: string;
    url: string;
    params?: any;
    data?: any;
    headers?: any;
}

export default class Api {
    private async _executeRequest(method:string, path:string, requestData?:any): Promise<any> {
        let config:axiosConfig = {
            method: method,
            url: path
        };
        if (process.env.NODE_ENV == "development" && process.env.PORT != '') {
            let port = parseInt(process.env.PORT||'80', 10);
            config.baseURL = `http://localhost:${port}`; //for debug
        }
        if (method == "get") config.params = requestData;
        if (method == "post" || method == "put") config.data = requestData;
        config.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
        return axios.request(config).then((response) => {
            if (response.status != 200) throw new Error(response.statusText);
            return response.data;
        });
    }

    async getStatus(): Promise<IStatus> {
        let path = "/api/status";
        // let requestData = { towerTypes };
        let data = await this._executeRequest("get", path);
        return data as IStatus;
    }

    async getBooks(): Promise<[IBookListEntry]> {
        let path = "/api/books";
        // let requestData = { towerTypes };
        let data = await this._executeRequest("get", path);
        let books = data.list.map((r:any) => r as IBookListEntry);
        return books;
    }

    async getBook(bookId:string): Promise<IBookEntry> {
        let path = `/api/books/${bookId}`;
        let data = await this._executeRequest("get", path);
        return data as IBookEntry;
    }

    async getPageBody(bookId:string, pageIndex:number): Promise<IPageEntry> {
        let path = `/api/books/${bookId}/pages/${pageIndex}`;
        let data = await this._executeRequest("get", path);
        return data as IPageEntry;
    }

    async doRefreshBooks(): Promise<[IBookListEntry]> {
        let path = "/api/do/refresh";
        let data = await this._executeRequest("get", path);
        let books = data.list.map((r:any) => r as IBookListEntry);
        return books;
    }
}