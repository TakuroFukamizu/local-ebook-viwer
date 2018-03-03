<template lang="pug">
md-app.md-waterfall(md-mode="fixed")
    md-app-toolbar.md-transparent
        .md-toolbar-row
            .md-toolbar-section-start
                md-button.md-icon-button(@click="menuVisible = !menuVisible")
                    md-icon menu
                router-link.nav-title.md-title(:to="'/'") {{ naviTitle() }}
            .md-toolbar-section-end
                md-button.md-icon-button(v-on:click="onRefresh")
                    md-icon refresh
                md-button.md-icon-button
                    md-icon more_vert
    md-app-drawer(:md-active.sync="menuVisible")
        md-toolbar.md-transparent(md-elevation="0") Navigation
        md-list
            md-list-item(@click="sideBarNavigation('/')")
                md-icon library_books
                span.md-list-item-text Library
            md-list-item
                md-icon bookmark
                span.md-list-item-text Bookmark
    md-app-content.grand-back
        md-content(v-show="$store.state.isLoading")
            md-progress-spinner(:md-diameter="200" :md-stroke="10" md-mode="indeterminate")
        router-view(v-show="!$store.state.isLoading")

</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class App extends Vue {
    menuVisible = false;

    naviTitle():string {
        return this.$store.state.naviTitle;
    }
    isLoading():boolean {
        return this.$store.state.isLoading;
    }

    onRefresh() {
        this.$store.state.eventBus.$emit('onRefresh');
    }

    sideBarNavigation(path) {
        this.$router.push(path);
    }
}
</script>

<style lang="sass" scoped>
@import "../styles/mixin"
@import "../styles/vars"

.md-app
    // 全画面fill
    width: 100vw
    height: 100vh

.nav-title
    display: block
    overflow: hidden
    width: calc(100vw - 170px) // FIXME

.grand-back
    background: rgba(#000, .06)
    margin: 0 !important
    width: 100% !important
    min-height: 100% !important
    height: auto

</style>