// Subscription to handle players moving/swapping when marked for execution

module.exports = store => {
  const handlePlayersMove = (mutation, state) => {
    const fromPlayerIndex = mutation.payload[0];
    if (fromPlayerIndex === state.session.markedPlayer) {
      store.commit("session/setMarkedPlayer", mutation.payload[1]);
    }
  };

  const handlePlayersSwap = (mutation, state) => {
    const fromPlayerIndex = mutation.payload[0];
    if (fromPlayerIndex === state.session.markedPlayer) {
      store.commit("session/setMarkedPlayer", mutation.payload[1]);
      return;
    }

    const toPlayerIndex = mutation.payload[1];
    if (toPlayerIndex === state.session.markedPlayer) {
      store.commit("session/setMarkedPlayer", mutation.payload[0]);
      return;
    }
  };

  store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case "players/move":
        handlePlayersMove(mutation, state);
        break;
      case "players/swap":
        handlePlayersSwap(mutation, state);
        break;
    }
  });
};
