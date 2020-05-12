import Vue from "vue";
import App from "./App";
import store from "./store";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faCamera,
  faCog,
  faHeartbeat,
  faSearchMinus,
  faSearchPlus,
  faTheaterMasks,
  faTimesCircle,
  faUser,
  faUserEdit,
  faUserFriends,
  faUsers,
  faVoteYea,
  faCheckSquare,
  faSquare,
  faRandom,
  faPeopleArrows,
  faBroadcastTower,
  faCopy,
  faExchangeAlt,
  faHandPointRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faBookOpen,
  faCamera,
  faCog,
  faHeartbeat,
  faSearchMinus,
  faSearchPlus,
  faTheaterMasks,
  faTimesCircle,
  faUser,
  faUserEdit,
  faUserFriends,
  faUsers,
  faVoteYea,
  faCheckSquare,
  faSquare,
  faRandom,
  faPeopleArrows,
  faBroadcastTower,
  faCopy,
  faExchangeAlt,
  faHandPointRight
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
