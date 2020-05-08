module.exports = store => {
  // setup

  // listen to mutations
  store.subscribe(({ type, payload }, state) => {
    console.log(type, payload, state);
  });
};
