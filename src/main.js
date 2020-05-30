import Vue from "vue";
import App from "./App";
import store from "./store";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const faIcons = [
  "BookOpen",
  "BroadcastTower",
  "Camera",
  "CheckSquare",
  "Cog",
  "Copy",
  "ExchangeAlt",
  "FileUpload",
  "HandPointRight",
  "Heartbeat",
  "Link",
  "PeopleArrows",
  "Random",
  "RedoAlt",
  "SearchMinus",
  "SearchPlus",
  "Square",
  "TheaterMasks",
  "TimesCircle",
  "Undo",
  "User",
  "UserEdit",
  "UserFriends",
  "Users",
  "VoteYea",
  "Chair"
];
library.add(...faIcons.map(i => fas["fa" + i]));
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
