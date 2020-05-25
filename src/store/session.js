class LiveSession {
  constructor(store) {
    this._wss = "wss://connect.websocket.in/v3/";
    this._key = "zXzDomOphNQ94tWXrHfT8E8gkxjUMSXOQt0ypZetKoFsIUiEBegqWNAlExyd";
    this._socket = null;
    this._isSpectator = true;
    this._gamestate = [];
    this._store = store;
    this._pingInterval = 30 * 1000; // 30 seconds between pings
    this._pingTimer = null;
    this._players = {}; // map of players connected to a session
    this._playerId = Math.random()
      .toString(36)
      .substr(2);

    // reconnect to previous session
    if (this._store.state.session.sessionId) {
      this.connect(this._store.state.session.sessionId);
    }
  }

  /**
   * Open a new session for the passed channel.
   * @param channel
   * @private
   */
  _open(channel) {
    this.disconnect();
    this._socket = new WebSocket(this._wss + channel + "?apiKey=" + this._key);
    this._socket.addEventListener("message", this._handleMessage.bind(this));
    this._socket.onopen = this._onOpen.bind(this);
    this._socket.onclose = () => {
      this._socket = null;
      this._store.commit("setSessionId", "");
      clearInterval(this._pingTimer);
      this._pingTimer = null;
    };
  }

  /**
   * Send a message through the socket.
   * @param command
   * @param params
   * @private
   */
  _send(command, params) {
    if (this._socket && this._socket.readyState === 1) {
      this._socket.send(JSON.stringify([command, params]));
    }
  }

  /**
   * Open event handler for socket.
   * @private
   */
  _onOpen() {
    if (this._isSpectator) {
      this._send("req", "gs");
    } else {
      this.sendGamestate();
    }
    this._ping();
  }

  /**
   * Send a ping message with player ID and ST flag.
   * @private
   */
  _ping() {
    this._send("ping", [this._isSpectator, this._playerId]);
    clearTimeout(this._pingTimer);
    this._pingTimer = setTimeout(this._ping.bind(this), this._pingInterval);
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
        break;
      case "ping":
        this._handlePing(params);
        break;
      case "bye":
        this._handleBye(params);
        break;
    }
  }

  /**
   * Connect to a new live session, either as host or spectator.
   * @param channel
   */
  connect(channel) {
    this._store.commit("setPlayerCount", 0);
    this._isSpectator = this._store.state.session.isSpectator;
    this._open(channel);
  }

  /**
   * Close the current session, if any.
   */
  disconnect() {
    this._store.commit("setPlayerCount", 0);
    if (this._socket) {
      this._send("bye", this._playerId);
      this._socket.close();
      this._socket = null;
    }
  }

  /**
   * Publish the current gamestate.
   */
  sendGamestate() {
    if (this._isSpectator) return;
    this._gamestate = this._store.state.players.players.map(player => ({
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
      gamestate: this._gamestate,
      edition: this._store.state.edition
    });
  }

  /**
   * Update the gamestate based on incoming data.
   * @param gamestate
   * @param edition
   * @private
   */
  _updateGamestate({ gamestate, edition }) {
    this._store.commit("setEdition", edition);
    const players = this._store.state.players.players;
    // adjust number of players
    if (players.length < gamestate.length) {
      for (let x = players.length; x < gamestate.length; x++) {
        this._store.commit("players/add", gamestate[x].name);
      }
    } else if (players.length > gamestate.length) {
      for (let x = players.length; x > gamestate.length; x--) {
        this._store.commit("players/remove", x - 1);
      }
    }
    // update status for each player
    gamestate.forEach((state, x) => {
      const player = players[x];
      const { name, isDead, isVoteless, role } = state;
      if (player.name !== name) {
        this._store.commit("players/update", {
          player,
          property: "name",
          value: name
        });
      }
      if (player.isDead !== isDead) {
        this._store.commit("players/update", {
          player,
          property: "isDead",
          value: isDead
        });
      }
      if (player.isVoteless !== isVoteless) {
        this._store.commit("players/update", {
          player,
          property: "isVoteless",
          value: isVoteless
        });
      }
      if (role && player.role.id !== role.id) {
        this._store.commit("players/update", {
          player,
          property: "role",
          value: role
        });
      } else if (!role && player.role.team === "traveler") {
        this._store.commit("players/update", {
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
    if (this._isSpectator || property === "reminders") return;
    const index = this._store.state.players.players.indexOf(player);
    if (property === "role") {
      if (value.team && value.team === "traveler") {
        // update local gamestate to remember this player as a traveler
        this._gamestate[index].role = {
          id: player.role.id,
          team: "traveler",
          name: player.role.name
        };
        this._send("player", {
          index,
          property,
          value: this._gamestate[index].role
        });
      } else if (this._gamestate[index].role) {
        delete this._gamestate[index].role;
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
    const player = this._store.state.players.players[index];
    if (!player) return;
    // special case where a player stops being a traveler
    if (
      property === "role" &&
      value.team !== "traveler" &&
      player.role.team === "traveler"
    ) {
      // reset to an unknown role
      this._store.commit("players/update", {
        player,
        property: "role",
        value: {}
      });
    } else {
      // just update the player otherwise
      this._store.commit("players/update", { player, property, value });
    }
  }

  /**
   * Handle a ping message by another player / storyteller
   * @param isSpectator
   * @param playerId
   * @private
   */
  _handlePing([isSpectator, playerId]) {
    const now = new Date().getTime();
    this._players[playerId] = now;
    // remove players that haven't sent a ping in twice the timespan
    for (let player in this._players) {
      if (now - this._players[player] > this._pingInterval * 2) {
        delete this._players[player];
      }
    }
    this._store.commit("setPlayerCount", Object.keys(this._players).length);
    if (!this._isSpectator && !isSpectator) {
      alert("Another storyteller joined the session!");
    }
  }

  /**
   * Handle a player leaving the sessions
   * @param playerId
   * @private
   */
  _handleBye(playerId) {
    delete this._players[playerId];
    this._store.commit("setPlayerCount", Object.keys(this._players).length);
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
      case "players/move":
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
