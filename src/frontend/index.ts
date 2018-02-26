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

import Vue2Touch from 'vue2-touch';

import VueSessionStorage from 'vue-sessionstorage';

import routes from './routes';
import StateStore from './model/StateStore';

import App from './components/App';
import SkFoldingCube from './components/widgets/SkFoldingCube';


// ------------

Vue.component('App', App);
Vue.component('sk-folding-cube', SkFoldingCube);

Vue.use(VueMaterial);
// Vue.material.registerTheme('default', {primary: 'blue'});
Vue.use(VueSessionStorage);
Vue.use(VueRouter);
Vue.use(Vue2Touch, {}); //configがundefinedだと ./node_modules/vue2-touch/directive.js でエラーになる

const router = new VueRouter(routes);


Vue.use(Vuex);

// ルートVueインスタンス
const rootConfig = {
    template: '<App ref="app" />',
    router,
    store: StateStore
};
new Vue(rootConfig).$mount('#app'); //index.htmlのエントリーポイントをマウントする
