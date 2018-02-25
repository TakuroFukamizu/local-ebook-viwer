<template lang='pug'>
div
    //- button(v-on:click="loadPages") Load books
    //- ul
    //-     li(v-for="item in pages")
    //-         img(v-bind:src="item.data")
    //-         span {{item.filepath}}
    template(v-if="loaded")
        .book-page.md-layout.md-alignment-center-center
            .md-layout-item.md-size-95
                //- img(v-bind:src="pages[currentPageIndex].data")
                //- span {{pages[currentPageIndex].filepath}}
                img(v-bind:src="currentPage.data")
                span {{currentPage.filepath}}
        .md-layout
            .md-layout-item.md-size-95
                md-progress-bar(md-mode="determinate", :md-value="pageProgress")
        .md-layout.md-alignment-bottom-center
            md-bottom-bar(md-sync-route)
                md-bottom-bar-item(v-on:click="prev()", md-label="PREV", md-icon="chevron_left")
                md-bottom-bar-item(v-on:click="next()", md-label="NEXT", md-icon="chevron_right")
    template(v-else)
        .book-page.md-layout.md-alignment-center-center
            sk-folding-cube.md-layout-item.md-size-50
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Api from '../api/api';
import {IBookEntry, IPageEntry} from '../../common/apiInterface';



@Component({})
export default class BookViwer extends Vue {
    // dataメンバー =======================

    loaded = false;

    book: IBookEntry | null = null;
    pages: IPageEntry[] = [];
    currentPageIndex = 0;
    pageProgress = 0;
    currentPage: IPageEntry = { //初期データはダミー
        filepath: 'dummy page',
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
        console.log(book);

        await this.loadPage(0); //最初のページ
        let currentPage = 
        let pages: IPageEntry[] = [];
        for(let i=0; i<book.pages.length; i++) {
            let key = book.pages[i].filepath;
            if (!this.$session.exists(key)) {
                let page = await this._api.getPageBody(bookId, i);
                pages.push(page);
                //sessionStorageを使ってキャッシュする
                this.$session.set(key, page.data);
            } else {
                let data = this.$session.get(key);
            }
        }
        this.$nextTick(() => { 
            console.log("on load page.");
            this._bookId = bookId;
            this.book = book;
            this.pages = pages;

            this.loaded = true;
        });
    }

    private loadPage(i:number): IPageEntry {
        let key = this.book.pages[i].filepath;
        for(let p of this.pages) {
            if(p.filepath == key) {
                console.info("load from memory");
                return p;
            }
        }
        if (this.$session.exists(key)) {
            let data = this.$session.get(key);
            console.info("load from sessionStorage");
            return { filepath: key, mime: "", data } as IPageEntry;
        }

        console.info("load from api");
        let page = await this._api.getPageBody(this._bookId, i);
        this.pages.push(page);
        //sessionStorageを使ってキャッシュする
        this.$session.set(key, page.data);
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

    next() {
        if (!this.book) return;
        let maxPage = this.book.pages.length;
        let value = this.currentPageIndex;
        value++;
        if (maxPage <= value) return;
        this.$nextTick(() => { 
            this.currentPageIndex = value;
            this.pageProgress = ((value + 1) / maxPage) * 100;
        });
    }

    prev() {
        if (!this.book) return;
        let maxPage = this.book.pages.length;
        let value = this.currentPageIndex;
        value--;
        if (value <= 0) return;
        this.$nextTick(() => { 
            this.currentPageIndex = value;
            this.pageProgress = ((value + 1) / maxPage) * 100;
        });
    }
}
</script>

<style lang='sass' scoped>
.book-page
    width: 100%;
    height: 100%;
    img
        width: 100%;
        height: 100%;

.phone-viewport
    width: 100%;
    height: 100%;
    // width: 322px;
    // height: 200px;
    display: inline-flex;
    align-items: flex-end;
    overflow: hidden;
    border: 1px solid rgba(#000, .26);
    background: rgba(#000, .06);

</style>