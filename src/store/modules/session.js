const state = () => ({
  sessionId: "",
  isSpectator: false,
  playerCount: 0,
  playerId: "",
  claimedSeat: -1,
  nomination: false,
  votes: [],
  lockedVote: -1
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
    state.votes = [];
  },
  vote(state, [index, vote]) {
    state.votes = [...state.votes];
    state.votes[index] = vote === undefined ? !state.votes[index] : vote;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
