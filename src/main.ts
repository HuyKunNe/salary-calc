import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import router from "./router";
import navie from "naive-ui";
createApp(App).use(navie).use(router).mount("#app");
