import Vue from "vue";
import Router from "vue-router";
// const originalPush = Router.prototype.push
// Router.prototype.push = function push(location, onResolve, onReject) {
//     if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
//     return originalPush.call(this, location).catch(err => err)
// }

Vue.use(Router);

export default new Router({
  // mode:'history',
  routes: [
    {
      path: "/graph/:type",
      name: "graph",
      component: () => import("../views/graph"),
    },
    {
      path: "/emergencyPlan",
      name: "emergencyPlan",
      component: () => import("@/views/emergencyPlan"),
      redirect: { name: "entry" },
      children: [
        {
          path: "entry",
          name: "entry",
          component: () => import("@/views/emergencyPlan/entry"),
        },
        {
          path: "planadmin",
          name: "planadmin",
          component: () => import("@/views/planadmin"),
        },
        {
          path: "addPlan",
          name: "addPlan",
          component: () => import("@/views/addPlan/index.vue"),
        },
      ],
    },
    {
      path: "/",
      name: "/",
      component: () => import("@/entry.vue"),
    },
  ]
});
