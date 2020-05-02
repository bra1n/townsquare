module.exports = store => {
  if (localStorage.background !== undefined) {
    store.commit("setBackground", localStorage.background);
  }
  if (localStorage.isPublic !== undefined) {
    store.commit("showGrimoire", JSON.parse(localStorage.isPublic));
  }
  if (localStorage.edition !== undefined) {
    store.commit("setEdition", localStorage.edition);
  }

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
    }
    console.log(type, payload);
  });
};
