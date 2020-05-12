class LiveSession {
  constructor(store) {
    this.wss = "wss://connect.websocket.in/v3/";
    this.key = "zXzDomOphNQ94tWXrHfT8E8gkxjUMSXOQt0ypZetKoFsIUiEBegqWNAlExyd";
    this.socket = null;
    this.isSpectator = true;
    this.gamestate = [];
    this.store = store;
  }

  /**
   * Open a new session for the passed channel.
   * @param channel
   * @private
   */
  _open(channel) {
    this.disconnect();
    this.socket = new WebSocket(this.wss + channel + "?apiKey=" + this.key);
    this.socket.addEventListener("message", this._handleMessage.bind(this));
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onclose = () => {
      this.socket = null;
      this.store.commit("setSessionId", "");
    };
  }

  /**
   * Send a message through the socket.
   * @param command
   * @param params
   * @private
   */
  _send(command, params) {
    if (this.socket) {
      this.socket.send(JSON.stringify([command, params]));
    }
  }

  /**
   * Open event handler for socket.
   * @private
   */
  _onOpen() {
    if (this.isSpectator) {
      this._send("req", "gs");
    } else {
      this.sendGamestate();
    }
  }

  /**
   * Handle an incoming socket message.
   * @param data
   * @private
   */
  _handleMessage({ data }) {
    let command, params;
    try {
      [command, params] = JSON.parse(data);
    } catch (err) {
      console.log("unsupported socket message", data);
    }
    switch (command) {
      case "req":
        if (params === "gs") {
          this.sendGamestate();
        }
        break;
      case "gs":
        this._updateGamestate(params);
        break;
      case "player":
        this._updatePlayer(params);
    }
  }

  /**
   * Connect to a new live session, either as host or spectator.
   * @param channel
   */
  connect(channel) {
    this.isSpectator = this.store.state.session.isSpectator;
    this._open(channel);
  }

  /**
   * Close the current session, if any.
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Publish the current gamestate.
   */
  sendGamestate() {
    if (this.isSpectator) return;
    this.gamestate = this.store.state.players.players.map(player => ({
      name: player.name,
      isDead: player.isDead,
      isVoteless: player.isVoteless,
      ...(player.role && player.role.team === "traveler"
        ? {
            role: {
              id: player.role.id,
              team: "traveler",
              name: player.role.name
            }
          }
        : {})
    }));
    this._send("gs", {
      gamestate: this.gamestate,
      edition: this.store.state.edition
    });
  }

  /**
   * Update the gamestate based on incoming data.
   * @param gamestate
   * @param edition
   * @private
   */
  _updateGamestate({ gamestate, edition }) {
    this.store.commit("setEdition", edition);
    const players = this.store.state.players.players;
    // adjust number of players
    if (players.length < gamestate.length) {
      for (let x = players.length; x < gamestate.length; x++) {
        this.store.commit("players/add", gamestate[x].name);
      }
    } else if (players.length > gamestate.length) {
      for (let x = players.length; x > gamestate.length; x--) {
        this.store.commit("players/remove", x - 1);
      }
    }
    // update status for each player
    gamestate.forEach((state, x) => {
      const player = players[x];
      const { name, isDead, isVoteless, role } = state;
      if (player.name !== name) {
        this.store.commit("players/update", {
          player,
          property: "name",
          value: name
        });
      }
      if (player.isDead !== isDead) {
        this.store.commit("players/update", {
          player,
          property: "isDead",
          value: isDead
        });
      }
      if (player.isVoteless !== isVoteless) {
        this.store.commit("players/update", {
          player,
          property: "isVoteless",
          value: isVoteless
        });
      }
      if (role && player.role.id !== role.id) {
        this.store.commit("players/update", {
          player,
          property: "role",
          value: role
        });
      } else if (!role && player.role.team === "traveler") {
        this.store.commit("players/update", {
          player,
          property: "role",
          value: {}
        });
      }
    });
  }

  /**
   * Publish a player update.
   * @param player
   * @param property
   * @param value
   */
  sendPlayer({ player, property, value }) {
    if (this.isSpectator || property === "reminders") return;
    const index = this.store.state.players.players.indexOf(player);
    if (property === "role") {
      if (value.team && value.team === "traveler") {
        // update local gamestate to remember this player as a traveler
        this.gamestate[index].role = {
          id: player.role.id,
          team: "traveler",
          name: player.role.name
        };
        this._send("player", {
          index,
          property,
          value: this.gamestate[index].role
        });
      } else if (this.gamestate[index].role) {
        delete this.gamestate[index].role;
        this._send("player", { index, property, value: {} });
      }
    } else {
      this._send("player", { index, property, value });
    }
  }

  /**
   * Update a player based on incoming data.
   * @param index
   * @param property
   * @param value
   * @private
   */
  _updatePlayer({ index, property, value }) {
    const player = this.store.state.players.players[index];
    if (!player) return;
    // special case where a player stops being a traveler
    if (
      property === "role" &&
      value.team !== "traveler" &&
      player.role.team === "traveler"
    ) {
      // reset to an unknown role
      this.store.commit("players/update", {
        player,
        property: "role",
        value: {}
      });
    } else {
      // just update the player otherwise
      this.store.commit("players/update", { player, property, value });
    }
  }
}

module.exports = store => {
  // setup
  const session = new LiveSession(store);

  // listen to mutations
  store.subscribe(({ type, payload }) => {
    switch (type) {
      case "setSessionId":
        if (payload) {
          session.connect(payload);
        } else {
          window.location.hash = "";
          session.disconnect();
        }
        break;
      case "players/set":
      case "players/swap":
      case "players/clear":
      case "players/remove":
      case "players/add":
      case "setEdition":
        session.sendGamestate();
        break;
      case "players/update":
        session.sendPlayer(payload);
        break;
    }
  });

  // check for session Id in hash
  const [command, param] = window.location.hash.substr(1).split("/");
  if (command === "play") {
    store.commit("setSpectator", true);
    store.commit("setSessionId", param);
  }
};
