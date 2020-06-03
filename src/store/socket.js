class LiveSession {
  constructor(store) {
    // this._wss = "ws://localhost:8081/";
    this._wss = "wss://baumgart.biz:8080/";
    this._socket = null;
    this._isSpectator = true;
    this._gamestate = [];
    this._store = store;
    this._pingInterval = 30 * 1000; // 30 seconds between pings
    this._pingTimer = null;
    this._players = {}; // map of players connected to a session
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
    this._socket = new WebSocket(this._wss + channel);
    this._socket.addEventListener("message", this._handleMessage.bind(this));
    this._socket.onopen = this._onOpen.bind(this);
    this._socket.onclose = () => {
      this._socket = null;
      this._store.commit("session/setSessionId", "");
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
    this._send("ping", [this._isSpectator, this._store.state.session.playerId]);
    this._handlePing();
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
      case "claim":
        this._updateSeat(params);
        break;
      case "ping":
        this._handlePing(params);
        break;
      case "nomination":
        this._store.commit("session/nomination", params);
        break;
      case "vote":
        this._store.commit("session/vote", params);
        break;
      case "bye":
        this._handleBye(params);
        break;
    }
  }

  /**
   * Connect to a new live session, either as host or spectator.
   * Set a unique playerId if there isn't one yet.
   * @param channel
   */
  connect(channel) {
    if (!this._store.state.session.playerId) {
      this._store.commit(
        "session/setPlayerId",
        Math.random()
          .toString(36)
          .substr(2)
      );
    }
    this._store.commit("session/setPlayerCount", 0);
    this._isSpectator = this._store.state.session.isSpectator;
    this._open(channel);
  }

  /**
   * Close the current session, if any.
   */
  disconnect() {
    this._store.commit("session/setPlayerCount", 0);
    if (this._socket) {
      this._send("bye", this._store.state.session.playerId);
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
      id: player.id,
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
    if (!this._isSpectator) return;
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
      const { role } = state;
      // update relevant properties
      ["name", "id", "isDead", "isVoteless"].forEach(property => {
        const value = state[property];
        if (player[property] !== value) {
          this._store.commit("players/update", { player, property, value });
        }
      });
      // roles are special, because of travelers
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
  _handlePing([isSpectator, playerId] = []) {
    const now = new Date().getTime();
    if (playerId) {
      this._players[playerId] = now;
      if (!this._isSpectator && !isSpectator) {
        alert("Another storyteller joined the session!");
      }
    }
    // remove players that haven't sent a ping in twice the timespan
    for (let player in this._players) {
      if (now - this._players[player] > this._pingInterval * 2) {
        delete this._players[player];
      }
    }
    // remove claimed seats from players that are no longer connected
    this._store.state.players.players.forEach(player => {
      if (!this._isSpectator && player.id && !this._players[player.id]) {
        this._store.commit("players/update", {
          player,
          property: "id",
          value: ""
        });
      }
    });
    this._store.commit(
      "session/setPlayerCount",
      Object.keys(this._players).length
    );
  }

  /**
   * Handle a player leaving the sessions
   * @param playerId
   * @private
   */
  _handleBye(playerId) {
    delete this._players[playerId];
    this._store.commit(
      "session/setPlayerCount",
      Object.keys(this._players).length
    );
  }

  /**
   * Claim a seat, needs to be confirmed by the Storyteller.
   * @param seat either -1 or the index of the seat claimed
   */
  claimSeat(seat) {
    if (!this._isSpectator) return;
    if (this._store.state.players.players.length > seat) {
      this._send("claim", [seat, this._store.state.session.playerId]);
    }
  }

  /**
   * Update a player id associated with that seat.
   * @param index seat index or -1
   * @param value playerId to add / remove
   * @private
   */
  _updateSeat([index, value]) {
    if (this._isSpectator) return;
    const property = "id";
    const players = this._store.state.players.players;
    // remove previous seat
    const oldIndex = players.findIndex(({ id }) => id === value);
    if (oldIndex >= 0 && oldIndex !== index) {
      this._store.commit("players/update", {
        player: players[oldIndex],
        property,
        value: ""
      });
    }
    // add playerId to new seat
    if (index >= 0) {
      const player = players[index];
      if (!player) return;
      this._store.commit("players/update", { player, property, value });
    }
    // update player session list as if this was a ping
    this._handlePing([true, value]);
  }

  /**
   * A player nomination.
   * @param nomination [nominator, nominee]
   */
  nomination(nomination) {
    if (this._isSpectator) return;
    const players = this._store.state.players.players;
    if (
      !nomination ||
      (players.length > nomination[0] && players.length > nomination[1])
    ) {
      this._send("nomination", nomination);
    }
  }

  /**
   * Send a vote.
   * @param index
   */
  vote([index]) {
    if (!this._isSpectator) return;
    this._send("vote", [index, this._store.state.session.votes[index]]);
  }
}

module.exports = store => {
  // setup
  const session = new LiveSession(store);

  // listen to mutations
  store.subscribe(({ type, payload }) => {
    switch (type) {
      case "session/setSessionId":
        if (payload) {
          session.connect(payload);
        } else {
          window.location.hash = "";
          session.disconnect();
        }
        break;
      case "session/claimSeat":
        session.claimSeat(payload);
        break;
      case "session/nomination":
        session.nomination(payload);
        break;
      case "session/vote":
        session.vote(payload);
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
    store.commit("session/setSpectator", true);
    store.commit("session/setSessionId", param);
  }
};
