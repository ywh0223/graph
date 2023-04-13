import Vue from 'vue'
import App from './entry.vue'
import router from "./router";

import "./assets/scss/index.scss";
import "./assets/icons/iconfont.css";
import "./assets/icons/iconfont.js";
// 导航图标
import "./assets/navicons/iconfont.css";
// import "./assets/navicons/iconfont.js";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
