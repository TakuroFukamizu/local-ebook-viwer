<template lang="pug">
md-app.md-waterfall(md-mode="flexible")
    md-app-toolbar.md-transparent
        .md-toolbar-row
            .md-toolbar-section-start
                md-button.md-icon-button(@click="menuVisible = !menuVisible")
                    md-icon menu
                router-link.md-title(:to="'/'") {{ naviTitle() }}
            .md-toolbar-section-end
                md-button.md-icon-button(v-on:click="onRefresh")
                    md-icon refresh
                md-button.md-icon-button
                    md-icon more_vert
    md-app-drawer(:md-active.sync="menuVisible")
        md-toolbar.md-transparent(md-elevation="0") Navigation
        md-list
            md-list-item
                md-icon move_to_inbox
                span.md-list-item-text Inbox
    md-app-content.grand-back
        router-view

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

    onRefresh() {
        this.$store.state.eventBus.$emit('onRefresh');
    }
}
</script>

<style lang="sass" scoped>
@import "../styles/mixin"
@import "../styles/vars"

.md-app
    @include max-screen($breakpoint-tablet)
        max-height: 1024px
    @include max-screen($breakpoint-mobile)
        max-height: 736px
    // border: 1px solid rgba(#000, .12)

// .md-app-toolbar
//     height: 80px

.grand-back
    background: rgba(#000, .06)
    // height:calc(100% +300px)
    margin: 0 !important
    width: 100% !important
    min-height: 100% !important
    height: auto

</style>