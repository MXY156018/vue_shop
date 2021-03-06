import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from 'views/Login.vue'
import Home from 'views/home/index'
import Welcome from 'views/Welcome'
import Users from 'views/user/users'
import Roles from 'views/right/roles'
import Rights from 'views/right/Rights'
import Cate from 'views/goods/Cate'
import Params from 'views/goods/Params'
import GoodsList from 'views/goods/GoodsList'
import Add from 'views/goods/Add'
import Order from 'views/order/Order'
import Report from 'views/report/Report'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            {
                path: '/welcome',
                component: Welcome
            },
            {
                path: '/users',
                component: Users
            },
            {
                path:'/roles',
                component: Roles
            },
            {
                path: '/rights',
                component: Rights
            },
            {
                path: '/categories',
                component: Cate
            },
            {
                path: '/params',
                component: Params
            },
            {
                path: '/goods',
                component: GoodsList
            },
            {
                path: '/goods/add',
                component: Add
            },
            {
                path: '/orders',
                component: Order
            },
            {
                path: '/reports',
                component: Report
            },
          
        ]
    },

]
const router = new VueRouter({
    routes,
    mode: 'history'
})
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next();
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login');
    next();
})

export default router
