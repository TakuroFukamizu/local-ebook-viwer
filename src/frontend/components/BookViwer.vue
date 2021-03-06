<template lang='pug'>
div
    .book-page.md-layout.md-gutter.md-alignment-center-center
        .md-layout-item.md-small-hide
            div(v-on:click="prev")
                md-icon keyboard_arrow_left
        .md-layout-item
            .md-caption
                div {{book.dirname}}
                div(v-if="book.comment") {{book.comment}}
                div
                    span(v-for="tag in book.tags") {{ tag }},
            .page-body
                div(style="margin-left:auto; margin-right:auto;" v-touch:swipe="onSwipe")
                    img(v-bind:src="currentPage.data" style="max-height:100vh; width:auto; height:auto;")
            //- div.md-caption {{currentPage.filepath}}
            //- div.md-caption {{currentPage.name}}
        .md-layout-item.md-small-hide
            div(v-on:click="next")
                md-icon keyboard_arrow_right
    .md-layout.md-alignment-center-bottom(style="margin-top:20px;")
        .md-layout-item.md-size-100(style="text-align:center;")
            div {{currentPageIndex + 1}} / {{maxPage}}
            md-progress-bar(md-mode="determinate", :md-value="pageProgress")
        .md-layout-item.md-small-size-100.md-layout.md-alignment-center-bottom
            .md-laytou-item(v-on:click="prev" style="width:25vw; text-align:center;")
                md-icon keyboard_arrow_left
                span Prev
            .md-laytou-item(style="width:35vw; text-align:center;")
                span |
            .md-laytou-item(v-on:click="next" style="width:25vw; text-align:center;")
                span Next
                md-icon keyboard_arrow_right
    md-speed-dial.md-bottom-right(md-event="click")
        md-speed-dial-target
            md-icon add
        md-speed-dial-content
            md-button.md-icon-button
                md-icon note
            md-button.md-icon-button(v-on:click="addBookmark")
                md-icon favorite
            md-button.md-icon-button(v-on:click="backToHome()")
                md-icon close
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Api from '../api/api';
import {IBookEntry, IPageEntry} from '../../common/apiInterface';
import { switchCase } from 'babel-types';
import LocalData from '../model/LocalData';

interface IPageStatus {
    index: number;
    isLoading: boolean;
    isLoaded: boolean;
}
@Component({})
export default class BookViwer extends Vue {
    // dataメンバー =======================
    book: IBookEntry | null = null;
    pages: IPageEntry[] = []; //load順
    pagesStatus: IPageStatus[] = [];
    maxPage = 0;
    currentPageIndex = 0;
    pageProgress = 0;
    currentPage: IPageEntry = { //初期データはダミー
        filepath: 'dummy page',
        name: 'dummy',
        birthTimeMs: 0,
        accessTimeMs: 0, //最終アクセス時刻 (access time)
        modifyTimeMs: 0, //最終変更時刻 (modify time)
        mime: '',
        data: ''
    };

    private _api = new Api();
    private _bookId: string = '';

    EVENT_CANCEL_PRELOAD = 'cancel_preload';

    // methodsメンバー(vue) =======================
    async mounted() {
        this.$store.commit('isLoadingStart');

        this._api = new Api();

        // this.$nextTick(() => {
        //     console.log("on load page.");
        //     this._bookId = this.$route.params.bookId;
        // })
        const bookId = this.$route.params.bookId;
        this._bookId = bookId;

        let book = await this._api.getBook(bookId);
        this.book = book;
        console.log(book);
        this.pagesStatus = book.pages.map((p, i) => {
            return { index: i, isLoading: false, isLoaded: false } as IPageStatus;
        });

        let currentPageIndex = 0;
        let lastPageIndex = LocalData.getLastPageIndex(bookId, 0);
        if (lastPageIndex != -1) currentPageIndex = lastPageIndex; //読了以外なら反映
        // let currentPageIndex = 0; //TODO:前回最終表示ページを取得
        let currentPage = await this.loadPage(currentPageIndex); //最初のページ

        this.preload();

        this.$store.commit('setNaviTitle', book.dirname); //naviのタイトルをディレクトリ名に

        this.$nextTick(() => { 
            console.log("on load page.");

            this._bookId = bookId;
            this.book = book;
            // this.pages = pages;
            this.currentPage = currentPage;
            this.currentPageIndex = currentPageIndex;
            this.maxPage = book.pages.length;

            this.$store.commit('isLoadingEnd');
        });
    }

    private cancelPreload() {
        this.$emit(this.EVENT_CANCEL_PRELOAD);
    }

    private preload() {
        const book = this.book;
        if (!book) return;
        let canceled = false;
        this.$on(this.EVENT_CANCEL_PRELOAD, () => {
            canceled = true;
        })
        setTimeout(async () => {
            for (const {p, i} of book.pages.map((p, i) => ({ p, i }))) {
                if (canceled) break;
                if (this.pagesStatus[i].isLoading || this.pagesStatus[i].isLoaded) {
                    continue; //処理不要
                }
                this.pagesStatus[i].isLoading = true;
                await this.loadPage(i);
                this.pagesStatus[i].isLoading = false;
                this.pagesStatus[i].isLoaded = true;
            }
        }, 500);
    }

    private async loadPage(i:number): Promise<IPageEntry> {
        console.info(`loadPage${i}`);
        if (!this.book) throw new Error("invalid operation");
        
        let key = this.book.pages[i].filepath;
        for(let p of this.pages) {
            if(p.filepath == key) {
                console.info("load from memory");
                return p;
            }
        }
        // if (this.$session.exists(key)) {
        //     let data = this.$session.get(key);
        //     console.info("load from sessionStorage");
        //     return { filepath: key, name:"", mime: "", data } as IPageEntry;
        // }

        console.info("load from api");
        this.pagesStatus[i].isLoading = true;
        this.pagesStatus[i].isLoaded = false;

        let page = await this._api.getPageBody(this._bookId, i);
        this.pages.push(page);

        this.pagesStatus[i].isLoading = false;
        this.pagesStatus[i].isLoaded = true;
        //sessionStorageを使ってキャッシュする
        // this.$session.set(key, page.data);
        return page;
    }

    // methodsメンバー(router) =======================
    beforeRouteEnter () {
        console.log('beforeRouteEnter');
        // TODO リストのロード
    }

    beforeRouteLeave (to, from, next) {
        console.log('beforeRouteLeave');
        this.cancelPreload();
    }

    // methodsメンバー =======================

    // async loadPages() {

    //     let book = await this._api.getBook(this._bookId);
    //     console.log(book);

    //     let pages: IPageEntry[] = [];
    //     for(let i=0; i<book.pages.length; i++) {
    //         let page = await this._api.getPageBody(this._bookId, i);
    //         pages.push(page);
    //     }
    //     this.$nextTick(() => { 
    //         this.book = book;
    //         this.pages = pages;
    //     });
    // }

    onSwipe(kind) {
        console.info(`onSwipe(${kind})`);
        switch(kind) {
            case "swipeleft":
                this.prev();
                break;
            case "swiperight":
                this.next();
        }
    }

    async next() {
        if (!this.book) return;
        let value = this.currentPageIndex;
        value++;
        if (this.maxPage <= value) return;

        let currentPage = await this.loadPage(value);
        // if (this.maxPage <= (value+1)) {
        //     setTimeout(() => {
        //         this.loadPage(value+1); //次ページ先読み
        //     }, 500);
        // }

        LocalData.setLastPageIndex(this.book.id, value);

        this.$nextTick(() => { 
            this.currentPage = currentPage;
            this.currentPageIndex = value;
            this.pageProgress = ((value + 1) / this.maxPage) * 100;
        });
    }

    async prev() {
        if (!this.book) return;
        let value = this.currentPageIndex;
        value--;
        if (value < 0) return;

        let currentPage = await this.loadPage(value);
        if (value != (this.maxPage+1)) {
            LocalData.setLastPageIndex(this.book.id, value);
        } else {
            LocalData.setLastPageIndex(this.book.id, -1); //読了
        }

        this.$nextTick(() => { 
            this.currentPage = currentPage;
            this.currentPageIndex = value;
            this.pageProgress = ((value + 1) / this.maxPage) * 100;
        });
    }

    addBookmark() {
        this._api.setFav(this._bookId);
    }

    backToHome() {
        this.$router.go(-1);
    }
}
</script>

<style lang='sass' scoped>
@import "../styles/mixin"
@import "../styles/vars"
.book-page
    width: 100%
    height: calc(100vh - 150px) //FIXME
    padding-left: 0px
    padding-right: 0px
    margin-left: 0px
    margin-right: 0px

.page-body
    img
        display: block
        max-width: 100%
        max-height: calc(100% - 80px)
        width: auto
        height: auto


</style>