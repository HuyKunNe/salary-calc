import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import router from "./router";
import navie from "naive-ui";
import BackButton from "./components/BackToHomePageButton.vue";

createApp(App)
  .use(navie)
  .use(router)
  .component("BackButton", BackButton)
  .mount("#app");
