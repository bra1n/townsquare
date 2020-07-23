// helper functions
const set = key => (state, val) => {
  state[key] = val;
};

const handleVote = (state, [index, vote]) => {
  if (!state.nomination) return;
  state.votes = [...state.votes];
  state.votes[index] = vote === undefined ? !state.votes[index] : vote;
};

const state = () => ({
  sessionId: "",
  isSpectator: false,
  playerCount: 0,
  playerId: "",
  claimedSeat: -1,
  nomination: false,
  votes: [],
  lockedVote: 0,
  votingSpeed: 3
});

const getters = {};

const actions = {};

const mutations = {
  setSessionId: set("sessionId"),
  setPlayerId: set("playerId"),
  setSpectator: set("isSpectator"),
  setPlayerCount: set("playerCount"),
  setVotingSpeed: set("votingSpeed"),
  claimSeat: set("claimedSeat"),
  nomination(state, { nomination, votes, votingSpeed, lockedVote } = {}) {
    state.nomination = nomination || false;
    state.votes = votes || [];
    state.votingSpeed = votingSpeed || state.votingSpeed;
    state.lockedVote = lockedVote || 0;
  },
  /**
   * Store a vote with and without syncing it to the live session.
   * This is necessary in order to prevent infinite voting loops.
   * @param state
   * @param vote
   */
  vote: handleVote,
  voteSync: handleVote,
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
