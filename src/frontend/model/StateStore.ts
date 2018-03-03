import Vue from 'vue';
import Vuex from 'vuex';
import EventBus from './EventBus';

Vue.use(Vuex);

const StateStore = new Vuex.Store({
    state: {
        naviTitle: "Viewer",
        canReload: false,
        isLoading: false,
        eventBus: EventBus
    },
    mutations: {
        setNaviTitle(state, payload) {
            state.naviTitle = payload;
        },
        showReload(state) {
            state.canReload = true;
        },
        hideReload(state) {
            state.canReload = false;
        },
        isLoadingStart(state) {
            state.isLoading = true;
        },
        isLoadingEnd(state) {
            state.isLoading = false;
        }
    },
    getters: {
        naviTitle(state) { return state.naviTitle; },
        isLoading(state) { return state.isLoading; },
        eventBus(state) { return state.eventBus; }
    }
});
export default StateStore;