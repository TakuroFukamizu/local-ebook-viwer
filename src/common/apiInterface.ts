

export interface IStatus {
    isStillLoading: boolean;
    bookNum: number;
}

// ------------------------------

export interface IBookEntry {
    id: string;
    title: string;
    dirpath: string;
    dirname: string;
    thumbnail: string;

    pages: Array<IPageListEntry>;

    pageNum: number;
    birthTimeMs: number;
    accessTimeMs: number; //最終アクセス時刻 (access time)
    modifyTimeMs: number; //最終変更時刻 (modify time)
}

export interface IPageListEntry {
    filepath: string;
    name: string;
    birthTimeMs: number;
    accessTimeMs: number; //最終アクセス時刻 (access time)
    modifyTimeMs: number; //最終変更時刻 (modify time)
    mime: string;
    thumbnail: string;
}

// ------------------------------

export interface IPageEntry {
    filepath: string;
    name: string;
    birthTimeMs: number;
    accessTimeMs: number; //最終アクセス時刻 (access time)
    modifyTimeMs: number; //最終変更時刻 (modify time)
    mime: string;
    data: string;
}

// ------------------------------

export interface IBookListEntry {
    id: string;
    title: string;
    dirpath: string;
    dirname: string;

    thumbnail: string;

    pageNum: number;
    birthTimeMs: number;
    accessTimeMs: number; //最終アクセス時刻 (access time)
    modifyTimeMs: number; //最終変更時刻 (modify time)
}

