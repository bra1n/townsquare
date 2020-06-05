const state = () => ({
  sessionId: "",
  isSpectator: false,
  playerCount: 0,
  playerId: "",
  claimedSeat: -1,
  nomination: false,
  votes: [],
  lockedVote: 0
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
    state.lockedVote = 0;
  },
  vote(state, [index, vote]) {
    if (!state.nomination) return;
    state.votes = [...state.votes];
    state.votes[index] = vote === undefined ? !state.votes[index] : vote;
  },
  lockVote(state, lock) {
    state.lockedVote = lock !== undefined ? lock : state.lockedVote + 1;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
