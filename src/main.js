import Vue from "vue";
import App from "./App";
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
  faUserFriends,
  faUsers,
  faVoteYea,
  faCheckSquare,
  faSquare,
  faRandom,
  faPeopleArrows
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
  faUserFriends,
  faUsers,
  faVoteYea,
  faCheckSquare,
  faSquare,
  faRandom,
  faPeopleArrows
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
