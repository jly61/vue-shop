// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
//过滤器
import {currency} from "./utils/currency";
//状态管理
import Vuex from 'vuex';

Vue.config.productionTip = false
Vue.use(VueLazyLoad, {
    loading: '/static/loading/loading-bars.svg'
});
Vue.use(infiniteScroll);
Vue.use(Vuex);

Vue.filter('currency',currency);
/* eslint-disable no-new */

//定义Vuex store
const store = new Vuex.Store({
    state: {
        cartCount: 0
    },
    mutations: {
        updateCartCount(state,cartCount){
                state.cartCount += cartCount;
        },
        initCartCount(state,cartCount){
            state.cartCount = cartCount;
        }
    }
});

new Vue({
    el: '#app',
    store,
    router,
    components: {App},
    template: '<App/>'
});
