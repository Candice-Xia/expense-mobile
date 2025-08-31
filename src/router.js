import { createRouter, createWebHistory } from 'vue-router';
import baseUrl from './baseUrl';

var routerBaseUrl = baseUrl;
if (process.env.NODE_ENV === 'production') {
  routerBaseUrl += 'Mobile/';
}

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "Home" */'./views/Home.vue')
  },     
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "Login" */'./views/Login.vue')
  },     
  {
    path: '/helloworld',
    name: 'helloworld',
    component: () => import(/* webpackChunkName: "HelloWorld" */'./views/HelloWorld.vue')
  }, {
    path: '/NewStep1',
    name: 'NewStep1',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "NewStep1" */'./views/Expense/NewStep1.vue')
  }, {
    path: '/NewStep2',
    name: 'NewStep2',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "NewStep2" */'./views/Expense/NewStep2.vue')
  }, {
    path: '/NewItem/:id',
    name: 'NewItem',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "NewItem" */'./views/Expense/NewItem.vue')
  }, {
    path: '/EditItem',
    name: 'EditItem',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "EditItem" */'./views/Expense/EditItem.vue')
  },{
    path: '/EditItem/:id',
    name: 'EditItem2',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "EditItem" */'./views/Expense/EditItem.vue')
  }, {
    path: '/ReviewItem',
    name: 'ReviewItem',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "ReviewItem" */'./views/Expense/EditItem.vue')
  },
  {
    path: '/ReviewItem/:id',
    name: 'ReviewItem2',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "ReviewItem" */'./views/Expense/EditItem.vue')
  },
  {
    path: '/NewCashAdvance/:id',
    name: 'NewCashAdvance',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "NewCashAdvance" */'./views/Expense/NewCashAdvance.vue')
  }, {
    path: '/Edit/:id',
    name: 'Edit',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "Edit" */'./views/Expense/Edit.vue')
  }, {
    path: '/Review/:id',
    name: 'Review',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "Edit" */'./views/Expense/Edit.vue')
  }, {
    path: '/Submit/:id',
    name: 'Submit',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "Submit" */'./views/Expense/Submit.vue')
  }, {
    path: '/Approve',
    name: 'Approve',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "Approve" */'./views/Expense/Approve.vue')
  }, {
    path: '/ContactsPage',
    name: 'ContactsPage',
    meta: { requireAuth: true },
    component: () => import(/* webpackChunkName: "ContactsPage" */'./views/Expense/ContactsPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(routerBaseUrl),
  routes
});

function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = ["Android", "iPhone",
    "SymbianOS", "Windows Phone",
    "iPad", "iPod"];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}
router.beforeEach((to, from, next) => {
  var path = to.path.toLowerCase();
  if (process.env.NODE_ENV != 'production') {
    if (path.indexOf("expense.mobile") >= 0) {
      next({
        name: 'home'
      });
      return;
    }
  }
  next();
});

export default router
