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

const editionJSONbyId = new Map(
  editionJSON.map(edition => [edition.id, edition])
);
const rolesJSONbyId = new Map(rolesJSON.map(role => [role.id, role]));
const fabled = new Map(fabledJSON.map(role => [role.id, role]));

const getRolesByEdition = (edition = editionJSON[0]) => {
  return new Map(
    rolesJSON
      .filter(r => r.edition === edition.id || edition.roles.includes(r.id))
      .sort((a, b) => b.team.localeCompare(a.team))
      .map(role => [role.id, role])
  );
};

const getTravellersNotInEdition = (edition = editionJSON[0]) => {
  return new Map(
    rolesJSON
      .filter(
        r =>
          r.team === "traveler" &&
          r.edition !== edition.id &&
          !edition.roles.includes(r.id)
      )
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
      isNight: false,
      isNightOrder: true,
      isPublic: true,
      isMenuOpen: false,
      isMuted: false,
      zoom: 0,
      background: ""
    },
    modals: {
      edition: false,
      fabled: false,
      gameState: false,
      nightOrder: false,
      reference: false,
      reminder: false,
      role: false,
      roles: false,
      voteHistory: false
    },
    edition: editionJSONbyId.get("tb"),
    roles: getRolesByEdition(),
    extraTravellers: getTravellersNotInEdition(),
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
            if (
              prop === "image" &&
              value.toLocaleLowerCase().includes(imageBase)
            ) {
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
    },
    rolesJSONbyId: () => rolesJSONbyId
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
    toggleNight({ grimoire }, isNight) {
      if (isNight === true || isNight === false) {
        grimoire.isNight = isNight;
      } else {
        grimoire.isNight = !grimoire.isNight;
      }
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
    setIsMuted({ grimoire }, isMuted) {
      grimoire.isMuted = isMuted;
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
              rolesJSONbyId.get(role.id) ||
              state.roles.get(role.id) ||
              Object.assign({}, customRole, role)
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
      if (editionJSONbyId.has(edition.id)) {
        state.edition = editionJSONbyId.get(edition.id);
        state.roles = getRolesByEdition(state.edition);
        state.extraTravellers = getTravellersNotInEdition(state.edition);
      } else {
        state.edition = edition;
      }
      state.modals.edition = false;
    }
  },
  plugins: [persistence, socket]
});
