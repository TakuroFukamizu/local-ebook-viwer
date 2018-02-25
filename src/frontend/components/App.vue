<template lang="pug">
md-app
    md-app-toolbar.md-transparent
        router-link.nav-item(:to="'/'")
            h3.md-title Viwer
        md-button.md-icon-button
            md-icon refresh
        md-button.md-icon-button
            md-icon more_vert

    md-app-content
        router-view

</template>

<script lang='ts'>
export default {
    name: 'App',
    computed: {
        canReload():boolean {
            // return this.$store.state.canReload
            return true;
        }
    }
}
</script>