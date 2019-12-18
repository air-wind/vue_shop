import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
// 引入字体图标
import './assets/font/iconfont.css'
// 引入tree-table
import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 引入富文本编辑器所需的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 导入axios
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
axios.interceptors.request.use(config => {
  // 进度条开始
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 规定
  return config
})
axios.interceptors.response.use(config => {
  // 进度条结束
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
// 注册tree-table
Vue.component('tree-table', TreeTable)
// 注册日期过滤器
Vue.filter('dateFormate', function (val) {
  const date = new Date(val)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')

  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  const ss = date.getSeconds().toString().padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
