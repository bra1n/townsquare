const state = () => ({
  players: []
});
const getters = {};
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
        commit("updatePlayer", index, player);
      }
    });
  }
};
const mutations = {
  setPlayers(state, players = []) {
    state.players = players;
  },
  updatePlayer(state, index, player) {
    state.players[index] = player;
  },
  addPlayer(state, name) {
    state.players.push({
      name,
      role: {},
      reminders: []
    });
  },
  removePlayer(state, index) {
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
