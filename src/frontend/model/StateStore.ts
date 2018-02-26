import Vue from 'vue';
import Vuex from 'vuex';
import EventBus from './EventBus';

Vue.use(Vuex);

const StateStore = new Vuex.Store({
    state: {
        naviTitle: "Viewer",
        canReload: false,
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
        }
    },
    getters: {
        naviTitle(state) { return state.naviTitle; },
        eventBus(state) { return state.eventBus; }
    }
});
export default StateStore;