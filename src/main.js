import Vue from "vue";
import App from "./App";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUsers,
  faHeartbeat,
  faVoteYea,
  faUserFriends,
  faUser,
  faTimesCircle,
  faCogs,
  faSearchMinus,
  faSearchPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faUsers,
  faHeartbeat,
  faVoteYea,
  faUserFriends,
  faUser,
  faTimesCircle,
  faCogs,
  faSearchMinus,
  faSearchPlus
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
