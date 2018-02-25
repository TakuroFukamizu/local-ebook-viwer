import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
// import 'roboto-fontface/css/roboto/sass/roboto-fontface-regular.scss';
// import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '../../node_modules/font-roboto/dist/styles/roboto.css';
import 'webpack-md-icons';

import VueSessionStorage from 'vue-sessionstorage';

import routes from './routes';
import App from './components/App';
import SkFoldingCube from './components/widgets/SkFoldingCube';

// ------------

Vue.component('App', App);
Vue.component('sk-folding-cube', SkFoldingCube);

Vue.use(VueMaterial);
// Vue.material.registerTheme('default', {primary: 'blue'});
Vue.use(VueSessionStorage);
Vue.use(VueRouter);

const router = new VueRouter(routes);

// event bus
const bus = new Vue();

Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
        pageIndex: 0,
        canReload: false
    },
    mutations: {
        increment (state) {
            state.pageIndex++
        },
        showReload(state) {
            state.canReload = true;
        },
        hideReload(state) {
            state.canReload = false;
        }
    }
  })

// ルートVueインスタンス
const rootConfig = {
    template: '<App ref="app" />',
    router,
    store
};
new Vue(rootConfig).$mount('#app'); //index.htmlのエントリーポイントをマウントする
