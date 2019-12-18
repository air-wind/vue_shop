import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login'
const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Login')
// import Home from '../components/Homee'
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Homee')
// import Welcome from '../components/Welcome'
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Welcome')

// import Users from '../components/user/Users'
const Users = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/user/Users')
// import Rights from '../components/power/Rights'
const Rights = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Rights')
// import Roles from '../components/power/Roles'
const Roles = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Roles')

// import Cate from '../components/goods/Cate'
const Cate = () => import(/* webpackChunkName: "Cate-Params-List-Roles" */ '../components/goods/Cate')
// import Params from '../components/goods/Params'
const Params = () => import(/* webpackChunkName: "Cate-Params-List-Roles" */ '../components/goods/Params')
// import List from '../components/goods/List'
const List = () => import(/* webpackChunkName: "Cate-Params-List-Roles" */ '../components/goods/List')
// import Add from '../components/goods/Add'
const Add = () => import(/* webpackChunkName: "Cate-Params-List-Roles" */ '../components/goods/Add')

// import Order from '../components/order/Order'
const Order = () => import(/* webpackChunkName: "Order-Report" */ '../components/order/Order')
// import Report from '../components/report/Report'
const Report = () => import(/* webpackChunkName: "Order-Report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: 'login' },
  { path: '/login', name: 'login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ] }
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to 要访问的路径
  // 从哪跳转而来
  // next()放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
