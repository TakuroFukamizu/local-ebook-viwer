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
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Api from '../api/api';
import {IBookListEntry} from '../../common/apiInterface';

@Component({})
export default class BookList extends Vue {
    // dataメンバー =======================

    books: Array<IBookListEntry> = [];
    selectedBookId: string = '';

    // methodsメンバー(vue) =======================
    created() {
        console.log("on create page");
        console.log(this.$parent);
        this.$parent.$on('onRefresh', () => {
            this.loadBooks();
        });
    }
    async mounted() {
        console.log("on load page.");
        this.loadBooks();
        // api.getStatus();
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
    async loadBooks() {
        let api = new Api();
        let books = await api.getBooks();
        console.log(books);

        this.$store.commit('setNaviTitle', `${books.length} books`); //naviのタイトルをディレクトリ名に

        // this.$store.mutations.showReload(); 
        this.$nextTick(() => {
            this.$nextTick(() => { this.books = books });
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