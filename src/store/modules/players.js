const NEWPLAYER = {
  role: {},
  reminders: [],
  hasVoted: false,
  hasDied: false,
  firstNight: 0,
  otherNight: 0
};

const state = () => ({
  players: []
});

const getters = {
  nonTravelers({ players }) {
    const nonTravelers = players.filter(
      player => player.role.team !== "traveler"
    );
    return Math.min(nonTravelers.length, 15);
  }
};

const actions = {
  // recalculate night order for all players
  updateNightOrder({ state, commit }) {
    const firstNight = [0];
    const otherNight = [0];
    state.players.forEach(({ role }) => {
      if (role.firstNight && !firstNight.includes(role.firstNight)) {
        firstNight.push(role.firstNight);
      }
      if (role.otherNight && !otherNight.includes(role.otherNight)) {
        otherNight.push(role.otherNight);
      }
    });
    firstNight.sort((a, b) => a - b);
    otherNight.sort((a, b) => a - b);
    state.players.forEach((player, index) => {
      const first = Math.max(firstNight.indexOf(player.role.firstNight), 0);
      const other = Math.max(otherNight.indexOf(player.role.otherNight), 0);
      if (player.firstNight !== first || player.otherNight !== other) {
        player.firstNight = first;
        player.otherNight = other;
        commit("update", { index, player });
        console.log("updated night order for player", player.name);
      }
    });
  },
  randomize({ state, commit }) {
    const players = state.players
      .map(a => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map(a => a[1]);
    commit("set", players);
  },
  clearRoles({ state, commit }) {
    const players = state.players.map(({ name }) => ({
      name,
      ...NEWPLAYER
    }));
    commit("set", players);
  }
};

const mutations = {
  clear(state) {
    state.players = [];
  },
  set(state, players = []) {
    state.players = players;
  },
  update(state, { index, player }) {
    state.players[index] = player;
  },
  add(state, name) {
    state.players.push({
      name,
      ...NEWPLAYER
    });
  },
  remove(state, index) {
    state.players.splice(index, 1);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
