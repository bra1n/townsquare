import Vue from "vue";
import Vuex from "vuex";
import persistence from "./persistence";
import session from "./session";
import players from "./modules/players";
import editionJSON from "../editions.json";
import rolesJSON from "../roles.json";

Vue.use(Vuex);

const getRolesByEdition = (edition = "tb") => {
  const selectedEdition =
    editionJSON.find(({ id }) => id === edition) || editionJSON[0];
  return new Map(
    rolesJSON
      .filter(
        r => r.edition === edition || selectedEdition.roles.includes(r.id)
      )
      .sort((a, b) => b.team.localeCompare(a.team))
      .map(role => [role.id, role])
  );
};

export default new Vuex.Store({
  modules: {
    players
  },
  state: {
    grimoire: {
      isNightOrder: true,
      isPublic: true,
      isMenuOpen: false,
      isScreenshot: false,
      isScreenshotSuccess: false,
      zoom: 1,
      background: "",
      bluffs: [],
      sessionId: ""
    },
    modals: {
      edition: false,
      roles: false,
      role: false,
      reminder: false
    },
    edition: "tb",
    roles: getRolesByEdition()
  },
  mutations: {
    toggleMenu({ grimoire }) {
      grimoire.isMenuOpen = !grimoire.isMenuOpen;
    },
    toggleGrimoire({ grimoire }, isPublic) {
      if (isPublic === true || isPublic === false) {
        grimoire.isPublic = isPublic;
      } else {
        grimoire.isPublic = !grimoire.isPublic;
      }
      document.title = `Blood on the Clocktower ${
        grimoire.isPublic ? "Town Square" : "Grimoire"
      }`;
    },
    toggleNightOrder({ grimoire }) {
      grimoire.isNightOrder = !grimoire.isNightOrder;
    },
    updateZoom({ grimoire }, by = 0) {
      grimoire.zoom += by;
    },
    setBackground({ grimoire }, background) {
      grimoire.background = background;
    },
    setSessionId({ grimoire }, sessionId) {
      grimoire.sessionId = sessionId;
    },
    setBluff({ grimoire }, { index, role }) {
      grimoire.bluffs.splice(index, 1, role);
    },
    toggleModal({ modals }, name) {
      modals[name] = !modals[name];
    },
    updateScreenshot({ grimoire }, status) {
      if (status !== true && status !== false) {
        grimoire.isScreenshotSuccess = false;
        grimoire.isScreenshot = true;
      } else {
        grimoire.isScreenshotSuccess = status;
        grimoire.isScreenshot = false;
      }
    },
    setEdition(state, edition) {
      state.edition = edition;
      state.modals.edition = false;
      state.roles = getRolesByEdition(edition);
    }
  },
  plugins: [persistence, session]
});
