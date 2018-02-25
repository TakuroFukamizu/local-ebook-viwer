<template lang='pug'>
div
    md-list.md-triple-line
        md-list-item(v-for="item in books" :key="item.id" v-on:click="enterPage( item.id )")
            md-avatar
                img(v-bind:src="item.thumbnail")
            div.md-list-item-text
                span {{ item.title }}
                span 作家
                span 最終更新日
            md-button.md-icon-button.md-list-action
                md-icon.md-primary star
        md-divider.md-inset
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

    // methodsメンバー(vue) =======================
    mounted() {
        // this.$store.mutations.showReload(); 
        this.$nextTick(async () => {
            console.log("on load page.");
            let api = new Api();
            let books = await api.getBooks();
            console.log(books);
            this.$nextTick(() => { this.books = books });
        })
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
        this.$nextTick(() => { this.books = books });
    }

    enterPage(bookId:string) {
        this.$router.push(`/book/${bookId}`);
    }
}
</script>

<style lang='sass'>
</style>