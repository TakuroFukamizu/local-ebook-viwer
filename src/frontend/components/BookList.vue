<template lang='pug'>
div.md-layout.md-gutter.md-alignment-center

    md-card.book-entry.md-layout-item.md-large-size-25.md-small-size-40.md-xsmall-size-90.md-elevation-4(v-for="item in books" :key="item.id" v-on:click="enterPage( item.id )")
        md-card-media-cover(md-solid)
            md-card-media(md-ratio="4:3")
                img(v-bind:src="item.thumbnail" :alt="item.filepath" v-on:click="enterPage( item.id )")
        md-card-area
            md-card-header
                h4.md-title {{ item.title }}
                //- p.md-subhead hoge
            //- md-card-actions
            //-     md-button.md-icon-button
            //-         md-icon favorite
            //-     md-button.md-icon-button
            //-         md-icon menu
        //- md-card-expand
        //-     md-card-header
        //-         h4.md-title {{ item.title }}
        //-     md-card-actions(md-alignment="space-between")
        //-         md-card-expand-trigger
        //-             md-button.md-icon-button
        //-                 md-icon keyboard_arrow_down
        //-     md-card-expand-content
        //-         md-card-content

        //-             md-card-actions
        //-                 md-button.md-icon-button
        //-                     md-icon favorite
        //-                 md-button.md-icon-button
        //-                     md-icon menu
        //-             span Created at: {{ toLocaleTime(item.birthTimeMs) }}, Modified at: {{ toLocaleTime(item.modifyTimeMs) }}
    //- infinite-loading(@infinite="infiniteHandler" spinner="waveDots")
    //- div(v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10")
    button(@click="loadMore") more
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
// import InfiniteLoading from 'vue-infinite-loading';
import infiniteScroll from 'vue-infinite-scroll';
import Api from '../api/api';
import {IBookListEntry} from '../../common/apiInterface';

// Vue.component('infinite-loading', InfiniteLoading);

@Component({})
export default class BookList extends Vue {
    // dataメンバー =======================

    books: Array<IBookListEntry> = [];
    selectedBookId: string = '';

    _cursorNext = 0;
    _loadBooksUnit = 10;

    private busy = false;

    // components = { InfiniteLoading };

    // methodsメンバー(vue) =======================
    created() {
        console.log("on create page");
        
        this._cursorNext = 0;
        this._loadBooksUnit = 10;

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

    // methodsメンバー =======================
    async loadBooks(needRefresh:boolean=false) {
        let api = new Api();
        const start = this._cursorNext;
        const limit = this._loadBooksUnit;
        let books:IBookListEntry[]|null = null;
        if (needRefresh) {
            books = await api.doRefreshBooks(limit);
            this._cursorNext = 0;
            this.books = books;
        } else {
            books = await api.getBooks(start, limit);
            books = this.books.concat(books);
        }
        if (!books) return;
        this._cursorNext = books.length;

        this.$store.commit('setNaviTitle', `${books.length} books`); //naviのタイトルをディレクトリ名に

        // this.$store.mutations.showReload(); 
        this.$nextTick(() => {
            this.books = books || [];
        });
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