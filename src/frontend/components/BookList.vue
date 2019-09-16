<template lang='pug'>
div
    .md-layout.md-gutter.md-alignment-top-center
        md-card.book-entry.md-layout-item.md-large-size-15.md-small-size-40.md-xsmall-size-40.md-elevation-4(v-for="item in books" :key="item.id" v-on:click="enterPage( item.id )")
            md-card-media-cover(md-solid)
                //- md-card-media(md-ratio="3:4") //vue.common.js?2371:580 [Vue warn]: The md-ratio prop is invalid. Given value: 3:4. Available options: 16-9, 16/9, 16:9, 4-3, 4/3, 4:3, 1-1, 1/1, 1:1.
                md-card-media
                    img(v-bind:src="item.thumbnail" :alt="item.filepath" v-on:click="enterPage( item.id )")
            md-card-area
                md-card-header
                    h4.md-caption(style="margin:0px;" v-on:click="enterPage( item.id )") {{ item.title }} {{ item.dirname }}
                    .md-subhead.md-layout
                        .md-layout-item
                            md-icon remove_red_eye
                            span {{ item.readCount }}
                        .md-layout-item
                            md-icon(v-if="item.isBookmarked") favorite
                            md-icon(v-else) favorite_border
                    //- p.md-subhead hoge
                //- md-card-actions
                //-     md-button.md-icon-button
                //-         md-icon favorite
                //-     md-button.md-icon-button
                //-         md-icon menu
    .md-layout
        button.md-layout-item.md-size-100(@click="loadMore")
            md-icon refresh
    md-speed-dial.md-bottom-right(md-event="click")
        md-speed-dial-target
            md-icon toc
        md-speed-dial-content
            md-button.md-icon-button(v-on:click="searchDialogVisible = true")
                md-icon search
            md-button.md-icon-button(v-on:click="sortDialogVisible = true")
                md-icon sort
    
    md-dialog(:md-active.sync="sortDialogVisible")
        md-dialog-title Sort By
        div.md-gutter(style="padding: 0px 10px;")
            md-list
                md-radio.md-list-item(v-model="tempSortBy" value="title") Title
                md-radio.md-list-item(v-model="tempSortBy" value="created_desc") Creted At
                md-radio.md-list-item(v-model="tempSortBy" value="read_count_desc") Read Count
        md-dialog-actions
            md-button.md-primary(@click="sortDialogVisible = false; changeSortType(tempSortBy)") OK
            md-button(@click="sortDialogVisible = false") Cancel
    
    md-dialog-prompt(
        :md-active.sync="searchDialogVisible" 
        v-model="searchKeyword" 
        md-title="Search Keyword..." 
        md-confirm-text="OK")

</template>

<script lang='ts'>
// import Vue from 'vue';
// import Component from 'vue-class-component';
import { Vue, Component, Watch } from 'vue-property-decorator'
// import InfiniteLoading from 'vue-infinite-loading';
// import infiniteScroll from 'vue-infinite-scroll';
import Api from '../api/api';
import {IBookListEntry} from '../../common/apiInterface';

// Vue.component('infinite-loading', InfiniteLoading);

@Component
export default class BookList extends Vue {
    // dataメンバー =======================

    books: Array<IBookListEntry> = [];
    selectedBookId: string = '';

    sortDialogVisible = false;
    tempSortBy = "title";

    searchDialogVisible = false;
    searchKeyword = "";

    _cursorNext = 0;
    _loadBooksUnit = 10;
    _sortBy = "title";
    _keyword:string|null = null;

    private busy = false;

    // components = { InfiniteLoading };

    // methodsメンバー(vue) =======================
    created() {
        console.log("on create page");
        
        this._cursorNext = 0;
        this._loadBooksUnit = 10;
        this._sortBy = "title";
        this.tempSortBy = this._sortBy;

        this.$store.state.eventBus.$on('onRefresh', () => {
            this.$store.commit('isLoadingStart');
            this.loadBooks(true); //再取得
            this.$store.commit('isLoadingEnd');
        });
    }
    async mounted() {
        console.log("on load page.");
        this.$store.commit('isLoadingStart');

        await this.loadBooks();
        // api.getStatus();

        this.$store.commit('isLoadingEnd');
    }
    async loadMore() {
        this.busy = true;
        await this.loadBooks();
        this.busy = false;
    }
    async infiniteHandler($state) {
        await this.loadBooks();
        $state.loaded();
    }

    // methodsメンバー(router) =======================
    beforeRouteEnter () {
        console.log('beforeRouteEnter');
        // TODO リストのロード
    }

    beforeRouteLeave () {
        console.log('beforeRouteLeave');
    }

    // methodsメンバー(watcher) =======================
    @Watch('searchKeyword')
    onSearchKeywordChanged(val: string, oldVal: string) {
        //検索実行
        this._keyword = val;
        this.loadBooks(false, true);
    }

    // methodsメンバー =======================
    async loadBooks(needRefresh:boolean=false, clearClientCache:boolean=false) {
        const start = this._cursorNext;
        const limit = this._loadBooksUnit;
        const sortBy = this._sortBy;
        const keywrod = this._keyword;
        console.log('loadBooks ', needRefresh, clearClientCache, start, limit, sortBy, keywrod);

        const api = new Api();
        let books:IBookListEntry[]|null = null;
        if (needRefresh) {
            books = await api.doRefreshBooks(limit);
            this._cursorNext = 0;
        } if (clearClientCache) {
            books = await api.getBooks(0, limit, sortBy, keywrod);
        } else {
            books = await api.getBooks(start, limit, sortBy, keywrod);
            books = this.books.concat(books);
        }
        if (!books) return;
        this._cursorNext = books.length;

        this.$store.commit('setNaviTitle', `${books.length} books`); //naviのタイトルをディレクトリ名に

        // this.$store.mutations.showReload(); 
        this.$nextTick(() => {
            this.books.splice(0, this.books.length);
            this.books = books || [];
        });
    }

    async changeSortType(value:string) {
        console.log('changeSortType ', value);
        if (this._sortBy == value) return; //skip
        this._sortBy = value;
        await this.loadBooks(false, true);
    }

    enterPage(bookId:string) {
        console.log('goto ', bookId);
        this.$router.push(`/book/${bookId}`);
    }

    toLocaleTime(milisec:number) {
        console.log(milisec);
        return new Date(milisec).toLocaleString();
    }

    onSelectBook(bookId:string) {
        console.log("onSelectBook", bookId);
        this.selectedBookId = bookId;
        this.$nextTick(() => { this.selectedBookId = bookId });
    }

    isSelected(bookId:string) {
        // return (this.selectedBookId == bookId);
        return this.selectedBookId == bookId ? [ "card-expansion" ] : [];
    }
}
</script>

<style lang='sass'>
@import "../styles/mixin"
@import "../styles/vars"

.book-entry
    // @include max-screen($breakpoint-mobile)
    //     width: calc(100% - 35px)
    //     // max-height: 120px
    // @include min-screen($breakpoint-tablet)
    //     width: calc((100% - 40px) / 2)
    //     // max-height: 200px
    // display: inline-block
    // vertical-align: top
    margin-bottom: 20px
.card-expansion
    max-height: 100%

</style>