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

// global data maps
const editionJSONbyId = new Map(
  editionJSON.map(edition => [edition.id, edition])
);
const rolesJSONbyId = new Map(rolesJSON.map(role => [role.id, role]));
const fabled = new Map(fabledJSON.map(role => [role.id, role]));

// helper functions
const getRolesByEdition = (edition = editionJSON[0]) => {
  return new Map(
    rolesJSON
      .filter(r => r.edition === edition.id || edition.roles.includes(r.id))
      .sort((a, b) => b.team.localeCompare(a.team))
      .map(role => [role.id, role])
  );
};

const getTravelersNotInEdition = (edition = editionJSON[0]) => {
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

const set = key => ({ grimoire }, val) => {
  grimoire[key] = val;
};

const toggle = key => ({ grimoire }, val) => {
  if (val === true || val === false) {
    grimoire[key] = val;
  } else {
    grimoire[key] = !grimoire[key];
  }
};

// base definition for custom roles
const customRole = {
  id: "",
  name: "",
  image: "",
  ability: "",
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
      isStatic: false,
      isMuted: false,
      isImageOptIn: false,
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
    otherTravelers: getTravelersNotInEdition(),
    fabled
  },
  getters: {
    /**
     * Return all custom roles, with default values and non-essential data stripped.
     * Role object keys will be replaced with a numerical index to conserve bandwidth.
     * @param roles
     * @returns {[]}
     */
    customRolesStripped: ({ roles }) => {
      const customRoles = [];
      const customKeys = Object.keys(customRole);
      const strippedProps = [
        "firstNightReminder",
        "otherNightReminder",
        "isCustom"
      ];
      roles.forEach(role => {
        if (!role.isCustom) {
          customRoles.push({ id: role.id });
        } else {
          const strippedRole = {};
          for (let prop in role) {
            if (strippedProps.includes(prop)) {
              continue;
            }
            const value = role[prop];
            if (customKeys.includes(prop) && value !== customRole[prop]) {
              strippedRole[customKeys.indexOf(prop)] = value;
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
    setZoom: set("zoom"),
    setBackground: set("background"),
    toggleMuted: toggle("isMuted"),
    toggleMenu: toggle("isMenuOpen"),
    toggleNightOrder: toggle("isNightOrder"),
    toggleStatic: toggle("isStatic"),
    toggleNight: toggle("isNight"),
    toggleGrimoire: toggle("isPublic"),
    toggleImageOptIn: toggle("isImageOptIn"),
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
      const processedRoles = roles
        // replace numerical role object keys with matching key names
        .map(role => {
          if (role[0]) {
            const customKeys = Object.keys(customRole);
            const mappedRole = {};
            for (let prop in role) {
              if (customKeys[prop]) {
                mappedRole[customKeys[prop]] = role[prop];
              }
            }
            return mappedRole;
          } else {
            return role;
          }
        })
        // clean up role.id
        .map(role => {
          role.id = role.id.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
          return role;
        })
        // map existing roles to base definition or pre-populate custom roles to ensure all properties
        .map(
          role =>
            rolesJSONbyId.get(role.id) ||
            state.roles.get(role.id) ||
            Object.assign({}, customRole, role)
        )
        // default empty icons and placeholders
        .map(role => {
          if (rolesJSONbyId.get(role.id)) return role;
          role.imageAlt = // map team to generic icon
            {
              townsfolk: "good",
              outsider: "outsider",
              minion: "minion",
              demon: "evil",
              fabled: "fabled"
            }[role.team] || "custom";
          return role;
        })
        // filter out roles that don't match an existing role and also don't have name/ability/team
        .filter(role => role.name && role.ability && role.team)
        // sort by team
        .sort((a, b) => b.team.localeCompare(a.team));
      // convert to Map without Fabled
      state.roles = new Map(
        processedRoles
          .filter(role => role.team !== "fabled")
          .map(role => [role.id, role])
      );
      // update Fabled to include custom Fabled from this script
      state.fabled = new Map([
        ...processedRoles.filter(r => r.team === "fabled").map(r => [r.id, r]),
        ...fabledJSON.map(role => [role.id, role])
      ]);
      // update extraTravelers map to only show travelers not in this script
      state.otherTravelers = new Map(
        rolesJSON
          .filter(r => r.team === "traveler" && !roles.some(i => i.id === r.id))
          .map(role => [role.id, role])
      );
    },
    setEdition(state, edition) {
      if (editionJSONbyId.has(edition.id)) {
        state.edition = editionJSONbyId.get(edition.id);
        state.roles = getRolesByEdition(state.edition);
        state.otherTravelers = getTravelersNotInEdition(state.edition);
      } else {
        state.edition = edition;
      }
      state.modals.edition = false;
    },
    updateGameState(state, data) {
      // data from socket _sendGameState
      const {
        playerState,
        isLightweight,
        isRevealedGrimoire,
        isNight,
        isVoteHistoryAllowed,
        nomination,
        votingSpeed,
        votes,
        lockedVote,
        isVoteInProgress,
        markedPlayer,
        fabled,
        bluffs
      } = data;
      const players = state.players.players;
      // adjust number of players
      if (players.length < playerState.length) {
        for (let x = players.length; x < playerState.length; x++) {
          this.commit("players/add", playerState[x].name);
        }
      } else if (players.length > playerState.length) {
        for (let x = players.length; x > playerState.length; x--) {
          this.commit("players/remove", x - 1);
        }
      }
      // update status for each player
      playerState.forEach((state, x) => {
        const player = players[x];
        // properties we always update
        ["name", "id", "isDead", "isVoteless", "pronouns"].forEach(property => {
          const value = state[property];
          if (player[property] !== value) {
            this.commit("players/update", { player, property, value });
          }
        });
        // roles
        const { roleId } = state;
        if (roleId == {} && player.role.team === "traveler" && roleId !== -1) {
          // special case for when a player stopped being a traveler
          this.commit("players/update", {
            player,
            property: "role",
            value: {}
          });
        } else if (roleId !== -1 && player.role.id !== roleId) {
          const role =
            this.state.roles.get(roleId) ||
            this.getters.rolesJSONbyId.get(roleId) ||
            {};
          if (role) {
            this.commit("players/update", {
              player,
              property: "role",
              value: role
            });
          }
        }
        // reminder tokens
        if (state.reminders !== -1) {
          this.commit("players/update", {
            player,
            property: "reminders",
            value: state.reminders
          });
        }
      });
      if (!isLightweight) {
        this.commit("toggleNight", !!isNight);
        this.commit("session/setVoteHistoryAllowed", isVoteHistoryAllowed);
        if (nomination !== -1) {
          this.commit("session/nomination", {
            nomination,
            votes,
            votingSpeed,
            lockedVote,
            isVoteInProgress
          });
        }
        this.commit("session/setMarkedPlayer", markedPlayer);
        this.commit("players/setFabled", {
          fabled: fabled.map(f => state.fabled.get(f.id) || f)
        });
        // bluffs
        if (bluffs !== -1) {
          bluffs.forEach((bluff, i) => {
            const role =
              this.state.roles.get(bluff.roleId) ||
              this.getters.rolesJSONbyId.get(bluff.roleId) ||
              {};
            this.commit("players/setBluff", {
              index: i,
              role
            });
          });
        }
      }
      if (isRevealedGrimoire) {
        this.commit("session/setRevealedGrimoire", null);
      }
    }
  },
  plugins: [persistence, socket]
});
