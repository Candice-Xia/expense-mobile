"use strict";
import axios from "axios";
import baseUrl from '../baseUrl'
import VueCookies from 'vue-cookies'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  baseURL: baseUrl
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

var ajaxCounter = 0;

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    ajaxCounter++;
    window.showLoading();
    var token = VueCookies.get('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    // Do something with request error        
    ajaxCounter--;
    if (ajaxCounter <= 0) {
      window.hideLoading();
    }
    return Promise.reject(error);
  }
);


function routeToLogin(){
  if (process.env.NODE_ENV === 'production') {
    window.location.reload();
  } else {
    var url = window.location.href;
    var domain = url.substr(0, url.indexOf('/', 9));
    var path = url.substr(url.indexOf('/', 9));
    window.location.href = domain + '/login?ReturnUrl=' + path;
  }
}
// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data    
    ajaxCounter--;
    if (ajaxCounter <= 0) {
      window.hideLoading();
    }
    if(response.request.responseURL.toLowerCase().indexOf('mobile/login')>=0){
      routeToLogin();
    }
    return response;
  },
  function (error) {
    // Do something with response error    
    axios.get(baseUrl + "Home/Error1").then(function (msg) {
      if (!msg.data.isValid) {
        routeToLogin();
      }
    })
    ajaxCounter--;
    if (ajaxCounter <= 0) {
      window.hideLoading();
    }
    return Promise.reject(error);
  }
);

export default {
  install(app) {
    app.config.globalProperties.axios = _axios;
    app.config.globalProperties.$axios = _axios;
    window.axios = _axios;
  }
};
