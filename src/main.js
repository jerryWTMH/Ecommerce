// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import App from './App';
import router from './router';
import 'bootstrap';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import './bus';
import currencyFilter from './filters/currency';
import { ValidationObserver, ValidationProvider, extend, localize, configure } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';



Vue.config.productionTip = false
Vue.use(VueAxios, axios);
axios.defaults.withCredentials = true;
Vue.component('Loading', Loading); //全域啟用的方式
Vue.filter('currency', currencyFilter) // 左邊是自定義的名稱，右邊是component的名字

Object.keys(rules).forEach((rule) => {
  extend(rule, rules[rule]);
});
 
Vue.component('ValidationObserver', ValidationObserver)
Vue.component('ValidationProvider', ValidationProvider)
 
configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid'
  }
});
  

/* eslint-disable no-new */
new Vue({
  el: '#app', // 透過element指定id綁定app到畫面
  router,
  components: { App }, // 把元件載進來
  template: '<App/>'
})

router.beforeEach((to, from, next) => {
  console.log('to', to, 'from', from, 'next', next);
  if(to.meta.requiresAuth){
    const api = `${process.env.APIPATH}/api/user/check`;
    const vm = this;
    axios.post(api).then((response) =>{ // 開頭不能打vm.$http 因為router只有在component裡面才有作用!!?
      console.log(response.data);
      if (response.data.success){
        next();
      } else{
        next({
          path: '/login',
        })
      }
    })
  }else{
    next(); //直接放行
  }
  
})
