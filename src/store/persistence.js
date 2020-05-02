module.exports = store => {
  // initialize data
  if (localStorage.background !== undefined) {
    store.commit("setBackground", localStorage.background);
  }
  if (localStorage.isPublic !== undefined) {
    store.commit("showGrimoire", JSON.parse(localStorage.isPublic));
  }
  if (localStorage.edition !== undefined) {
    store.commit("setEdition", localStorage.edition);
  }
  if (localStorage.players) {
    store.commit(
      "players/setPlayers",
      JSON.parse(localStorage.players).map(player => ({
        ...player,
        role: store.state.roles.get(player.role) || {}
      }))
    );
  }

  // listen to mutations
  store.subscribe(({ type, payload }, state) => {
    switch (type) {
      case "toggleGrimoire":
      case "showGrimoire":
        localStorage.setItem(
          "isPublic",
          JSON.stringify(state.grimoire.isPublic)
        );
        break;
      case "setBackground":
        if (payload) {
          localStorage.setItem("background", payload);
        } else {
          localStorage.removeItem("background");
        }
        break;
      case "setEdition":
        localStorage.setItem("edition", payload);
        break;
      case "addPlayer":
      case "updatePlayer":
      case "removePlayer":
        localStorage.setItem(
          "players",
          JSON.stringify(
            state.players.players.map(player => ({
              ...player,
              role: player.role.id || {}
            }))
          )
        );
        break;
    }
    console.log(type, payload);
  });
};
