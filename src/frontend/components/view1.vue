<template lang='pug'>
div
    p {{ message }}
    p(v-bind:title="message") Hover your mouse over me for a few seconds to see my dynamically bound title!
    button(v-on:click="reverseMessage") Reverse Message
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class View1 extends Vue {
    // dataメンバー =======================
    message: string = "Hello Vue!";

    // methodsメンバー =======================
    reverseMessage() : void {
        this.message = this.message.split('').reverse().join('');
    }
}
</script>

<style lang='sass'>
</style>