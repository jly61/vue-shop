import Vue from 'vue'
import Router from 'vue-router'

import GoodsList from './../views/GoodsList';
import Cart  from './../views/Cart';
import UserAddress from '../views/UserAddress';
import OrderConfirm from './../views/OrderConfirm';
import OrderSuccess from './../views/OrderSuccess';
import tulin from './../views/tulin';

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'GoodsList',
            component: GoodsList
        },
        {
            path: '/cart',
            name: 'Cart',
            component: Cart
        },
        {
            path: '/address',
            name: 'UserAddress',
            component: UserAddress
        },
        {
            path: '/orderConfirm',
            name: 'OrderConfirm',
            component: OrderConfirm
        },
        {
            path: '/orderSuccess',
            name: 'OrderSuccess',
            component: OrderSuccess
        }
    ]
})
