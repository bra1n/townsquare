const state = () => ({
  sessionId: "",
  isSpectator: false,
  playerCount: 0,
  playerId: "",
  claimedSeat: -1,
  nomination: false
});

const getters = {};

const actions = {};

const mutations = {
  setSessionId(state, sessionId) {
    state.sessionId = sessionId;
  },
  setPlayerId(state, playerId) {
    state.playerId = playerId;
  },
  setSpectator(state, spectator) {
    state.isSpectator = spectator;
  },
  setPlayerCount(state, playerCount) {
    state.playerCount = playerCount;
  },
  claimSeat(state, claimedSeat) {
    state.claimedSeat = claimedSeat;
  },
  nomination(state, nomination) {
    state.nomination = nomination;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
