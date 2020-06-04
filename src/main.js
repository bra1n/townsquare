import Vue from "vue";
import App from "./App";
import store from "./store";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
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
  "Question",
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
  "VoteYea"
];
const fabIcons = ["Github", "Discord"];
library.add(
  ...faIcons.map(i => fas["fa" + i]),
  ...fabIcons.map(i => fab["fa" + i])
);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
