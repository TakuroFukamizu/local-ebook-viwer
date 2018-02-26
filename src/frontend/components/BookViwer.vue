<template lang='pug'>
div
    //- button(v-on:click="loadPages") Load books
    //- ul
    //-     li(v-for="item in pages")
    //-         img(v-bind:src="item.data")
    //-         span {{item.filepath}}
    template(v-if="loaded")
        .book-page.md-layout.md-gutter.md-alignment-center-center
            .page-body.md-layout-item
                div(style="margin-left:auto; margin-right:auto;" v-touch:swipe="onSwipe")
                    img(v-bind:src="currentPage.data")
                //- div.md-caption {{currentPage.filepath}}
                //- div.md-caption {{currentPage.name}}
        .md-layout.md-alignment-center-center(style="margin-top:20px;")
            .md-layout-item(style="text-align:center;")
                div {{currentPageIndex + 1}} / {{maxPage}}
                md-progress-bar(md-mode="determinate", :md-value="pageProgress")
        md-speed-dial.md-bottom-right(md-event="click")
            md-speed-dial-target
                md-icon add
            md-speed-dial-content
                md-button.md-icon-button
                    md-icon note
                md-button.md-icon-button
                    md-icon favorite
                md-button.md-icon-button(v-on:click="backToHome()")
                    md-icon close

    template(v-else)
        .md-layout.md-alignment-center-center
            sk-folding-cube.md-layout-item.md-size-50
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Api from '../api/api';
import {IBookEntry, IPageEntry} from '../../common/apiInterface';
import { switchCase } from 'babel-types';
import LocalData from '../model/LocalData';


@Component({})
export default class BookViwer extends Vue {
    // dataメンバー =======================

    loaded = false;

    book: IBookEntry | null = null;
    pages: IPageEntry[] = []; //load順
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

    // methodsメンバー(vue) =======================
    async mounted() {
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

        let currentPageIndex = 0;
        let lastPageIndex = LocalData.getLastPageIndex(bookId, 0);
        if (lastPageIndex != -1) currentPageIndex = lastPageIndex; //読了以外なら反映
        // let currentPageIndex = 0; //TODO:前回最終表示ページを取得
        let currentPage = await this.loadPage(currentPageIndex); //最初のページ

        this.$store.commit('setNaviTitle', book.dirname); //naviのタイトルをディレクトリ名に

        this.$nextTick(() => { 
            console.log("on load page.");
            this._bookId = bookId;
            this.book = book;
            // this.pages = pages;
            this.currentPage = currentPage;
            this.currentPageIndex = currentPageIndex;
            this.maxPage = book.pages.length;

            this.loaded = true;
        });
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
        let page = await this._api.getPageBody(this._bookId, i);
        this.pages.push(page);
        //sessionStorageを使ってキャッシュする
        // this.$session.set(key, page.data);
        return page;
    }

    // methodsメンバー(router) =======================
    beforeRouteEnter () {
        console.log('beforeRouteEnter');
        // TODO リストのロード
    }

    beforeRouteLeave () {
        console.log('beforeRouteLeave');
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
        if (this.maxPage <= (value+1)) {
            setTimeout(() => {
                this.loadPage(value+1); //次ページ先読み
            }, 500);
        }

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
        if (value <= 0) return;

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
    height: 100%

.page-body
    img
        @include max-screen($breakpoint-mobile)
            width: auto
            height: 500px
        @include min-screen($breakpoint-tablet)
            width: auto
            height: $breakpoint-tablet
        max-width: 100%
        max-height: 100%
    &:after
        width: 100%
        height: 100%
        display: block
        content: " "

.phone-viewport
    width: 100%
    height: 100%
    // width: 322px;
    // height: 200px;
    display: inline-flex
    align-items: flex-end
    overflow: hidden
    border: 1px solid rgba(#000, .26)
    background: rgba(#000, .06)

</style>