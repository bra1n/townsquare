import Vue from "vue";
import Vuex from "vuex";
import persistence from "./persistence";
import socket from "./socket";
import players from "./modules/players";
import session from "./modules/session";
import editionJSON from "../editions.json";
import rolesJSON from "../roles.json";
import fabledJSON from "../fabled.json";

Vue.use(Vuex);

const rolesJSONbyId = new Map(rolesJSON.map(role => [role.id, role]));
const fabled = new Map(fabledJSON.map(role => [role.id, role]));

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

// base definition for custom roles
const imageBase =
  "https://raw.githubusercontent.com/bra1n/townsquare/main/src/assets/icons/";
const customRole = {
  image: "",
  edition: "custom",
  firstNight: 0,
  firstNightReminder: "",
  otherNight: 0,
  otherNightReminder: "",
  reminders: [],
  remindersGlobal: [],
  setup: false,
  team: "townsfolk",
  isCustom: true
};

export default new Vuex.Store({
  modules: {
    players,
    session
  },
  state: {
    grimoire: {
      isNightOrder: true,
      isPublic: true,
      isMenuOpen: false,
      isScreenshot: false,
      isScreenshotSuccess: false,
      zoom: 0,
      background: ""
    },
    modals: {
      edition: false,
      fabled: false,
      nightOrder: false,
      reference: false,
      reminder: false,
      role: false,
      roles: false
    },
    edition: "tb",
    roles: getRolesByEdition(),
    fabled
  },
  getters: {
    /**
     * Return all custom roles, with default values stripped.
     * @param roles
     * @returns {[]}
     */
    customRoles: ({ roles }) => {
      const customRoles = [];
      roles.forEach(role => {
        if (!role.isCustom) {
          customRoles.push({ id: role.id });
        } else {
          const strippedRole = {};
          for (let prop in role) {
            const value = role[prop];
            if (prop === "image" && value.match(new RegExp("^" + imageBase))) {
              continue;
            }
            if (prop !== "isCustom" && value !== customRole[prop]) {
              strippedRole[prop] = value;
            }
          }
          customRoles.push(strippedRole);
        }
      });
      return customRoles;
    }
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
    setZoom({ grimoire }, zoom) {
      grimoire.zoom = zoom;
    },
    setBackground({ grimoire }, background) {
      grimoire.background = background;
    },
    toggleModal({ modals }, name) {
      if (name) {
        modals[name] = !modals[name];
      }
      for (let modal in modals) {
        if (modal === name) continue;
        modals[modal] = false;
      }
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
    /**
     * Store custom roles
     * @param state
     * @param roles Array of role IDs or full role definitions
     */
    setCustomRoles(state, roles) {
      state.roles = new Map(
        roles
          // map existing roles to base definition or pre-populate custom roles to ensure all properties
          .map(
            role =>
              rolesJSONbyId.get(role.id) || Object.assign({}, customRole, role)
          )
          // default empty icons to good / evil / traveler
          .map(role => {
            if (rolesJSONbyId.get(role.id)) return role;
            if (role.team === "townsfolk" || role.team === "outsider") {
              role.image = role.image || imageBase + "good.png";
            } else if (role.team === "demon" || role.team === "minion") {
              role.image = role.image || imageBase + "evil.png";
            } else {
              role.image = role.image || imageBase + "custom.png";
            }
            return role;
          })
          // filter out roles that don't match an existing role and also don't have name/ability/team
          .filter(role => role.name && role.ability && role.team)
          // sort by team
          .sort((a, b) => b.team.localeCompare(a.team))
          // convert to Map
          .map(role => [role.id, role])
      );
    },
    setEdition(state, edition) {
      state.edition = edition;
      state.modals.edition = false;
      if (edition !== "custom") {
        state.roles = getRolesByEdition(edition);
      }
    }
  },
  plugins: [persistence, socket]
});
