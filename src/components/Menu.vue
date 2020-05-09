<template>
  <div id="controls">
    <Screenshot ref="screenshot"></Screenshot>
    <font-awesome-icon
      icon="camera"
      @click="takeScreenshot()"
      v-bind:class="{ success: grimoire.isScreenshotSuccess }"
    />
    <div class="menu" v-bind:class="{ open: grimoire.isMenuOpen }">
      <font-awesome-icon icon="cog" @click="toggleMenu" />
      <ul>
        <!-- Grimoire -->
        <li class="headline">
          <font-awesome-icon icon="book-open" />
          Grimoire
        </li>
        <li @click="toggleGrimoire" v-if="players.length">
          <em>[G]</em>
          <template v-if="!grimoire.isPublic">Hide</template>
          <template v-if="grimoire.isPublic">Show</template>
        </li>
        <li @click="toggleNightOrder" v-if="players.length">
          <em
            ><font-awesome-icon
              :icon="['fas', grimoire.isNightOrder ? 'check-square' : 'square']"
          /></em>
          Night order
        </li>
        <li v-if="players.length">
          <em>
            <font-awesome-icon @click="updateZoom(-0.1)" icon="search-minus" />
            {{ Math.round(grimoire.zoom * 100) }}%
            <font-awesome-icon @click="updateZoom(0.1)" icon="search-plus" />
          </em>
          Zoom
        </li>
        <li @click="setBackground">
          Background image
        </li>
        <li @click="hostSession" v-if="!grimoire.sessionId">
          Host Live Session
        </li>
        <li @click="joinSession" v-if="!grimoire.sessionId">
          Join Live Session
        </li>
        <li class="headline" v-if="grimoire.sessionId">
          <font-awesome-icon icon="broadcast-tower" />
          {{ grimoire.isSpectator ? "Playing" : "Hosting" }}
        </li>
        <li @click="leaveSession" v-if="grimoire.sessionId">
          <em>{{ grimoire.sessionId }}</em>
          Leave Session
        </li>

        <template v-if="!grimoire.isSpectator">
          <!-- Users -->
          <li class="headline">
            <font-awesome-icon icon="users" />
            Players
          </li>
          <li @click="addPlayer" v-if="players.length < 20">
            <em>[A]</em> Add
          </li>
          <li @click="randomizeSeatings" v-if="players.length > 2">
            <em>[R]</em> Randomize
          </li>
          <li @click="clearPlayers" v-if="players.length">
            Remove all
          </li>

          <!-- Characters -->
          <li class="headline">
            <font-awesome-icon icon="theater-masks" />
            Characters
          </li>
          <li @click="toggleModal('edition')">
            <em>[E]</em>
            Select Edition
          </li>
          <li @click="toggleModal('roles')" v-if="players.length > 4">
            <em>[C]</em>
            Choose & Assign
          </li>
          <li @click="clearRoles" v-if="players.length">
            Remove all
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Screenshot from "./Screenshot";

export default {
  components: {
    Screenshot
  },
  computed: {
    ...mapState(["grimoire"]),
    ...mapState("players", ["players"])
  },
  methods: {
    takeScreenshot(dimensions = {}) {
      this.$store.commit("updateScreenshot");
      this.$refs.screenshot.capture(dimensions);
    },
    setBackground() {
      this.$store.commit(
        "setBackground",
        prompt("Enter custom background URL")
      );
    },
    hostSession() {
      const sessionId = prompt(
        "Enter a code for your session",
        Math.round(Math.random() * 10000)
      );
      if (sessionId) {
        this.$store.commit("setSpectator", false);
        this.$store.commit("setSessionId", sessionId.substr(0, 5));
      }
    },
    joinSession() {
      const sessionId = prompt(
        "Enter the code of the session you want to join"
      );
      if (sessionId) {
        this.$store.commit("setSpectator", true);
        this.$store.commit("setSessionId", sessionId.substr(0, 5));
      }
    },
    leaveSession() {
      this.$store.commit("setSpectator", false);
      this.$store.commit("setSessionId", "");
    },
    addPlayer() {
      if (this.grimoire.isSpectator) return;
      const name = prompt("Player name");
      if (name) {
        this.$store.commit("players/add", name);
      }
    },
    randomizeSeatings() {
      if (this.grimoire.isSpectator) return;
      if (confirm("Are you sure you want to randomize seatings?")) {
        this.$store.dispatch("players/randomize");
      }
    },
    clearPlayers() {
      if (this.grimoire.isSpectator) return;
      if (confirm("Are you sure you want to remove all players?")) {
        this.$store.commit("players/clear");
      }
    },
    clearRoles() {
      if (this.grimoire.isSpectator) return;
      this.$store.commit("showGrimoire");
      if (confirm("Are you sure you want to remove all player roles?")) {
        this.$store.dispatch("players/clearRoles");
      }
    },
    ...mapMutations([
      "toggleGrimoire",
      "toggleMenu",
      "toggleNightOrder",
      "updateScreenshot",
      "updateZoom",
      "toggleModal"
    ])
  }
};
</script>

<style scoped lang="scss">
@import "../vars.scss";

// success animation
@keyframes greenToWhite {
  from {
    color: green;
  }
  to {
    color: white;
  }
}

// Controls
#controls {
  position: absolute;
  right: 3px;
  top: 3px;
  text-align: right;

  #app.screenshot & {
    display: none;
  }

  svg {
    cursor: pointer;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1));
    &.success {
      animation: greenToWhite 1s normal forwards;
      animation-iteration-count: 1;
    }
  }

  .fa-camera {
    position: absolute;
    right: 50px;
    top: 10px;
    z-index: 5;
  }
}

.menu {
  width: 210px;
  transform-origin: 190px 22px;
  transition: transform 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: rotate(-90deg);

  &.open {
    transform: rotate(0deg);
  }

  > svg {
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    width: 40px;
    height: 50px;
    margin-bottom: -8px;
    border-bottom: 0;
    border-radius: 10px 10px 0 0;
    padding: 5px 5px 15px;
  }

  ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
    border-radius: 10px 0 10px 10px;

    li {
      padding: 2px 10px;
      color: white;
      text-align: left;
      background: rgba(0, 0, 0, 0.7);

      &:last-child {
        margin-bottom: 0;
      }

      &:not(.headline):hover {
        cursor: pointer;
        color: red;
      }

      em {
        float: right;
        font-style: normal;
        margin-left: 10px;
        font-size: 80%;
        line-height: 31px;
      }
    }

    .headline {
      padding: 5px 10px;
      text-align: center;
      font-weight: bold;
      background: linear-gradient(
        to right,
        $townsfolk 0%,
        rgba(0, 0, 0, 0.5) 20%,
        rgba(0, 0, 0, 0.5) 80%,
        $demon 100%
      );
    }
  }
}
</style>
