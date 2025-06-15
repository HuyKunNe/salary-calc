import { createRouter, createWebHistory } from "vue-router";

import HomePage from "../views/home.vue";
import ReportPage from "../views/report.vue";
import RateOfTeacher from "../views/rateOfTeacher.vue";
const routes = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/report",
    component: ReportPage,
  },
  {
    path: "/rate",
    component: RateOfTeacher,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
