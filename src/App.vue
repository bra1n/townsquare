<template>
  <div id="app" @keyup="keyup" tabindex="-1">
    <TownInfo :players="players" :edition="edition"></TownInfo>
    <TownSquare
      :is-public="isPublic"
      :players="players"
      :roles="roles"
      :zoom="zoom"
    ></TownSquare>

    <Modal
      class="editions"
      v-show="isEditionModalOpen"
      @close="isEditionModalOpen = false"
    >
      <h2>Select an edition:</h2>
      <ul class="editions">
        <li
          v-for="edition in editions"
          class="edition"
          v-bind:class="['edition-' + edition.id]"
          v-bind:key="edition.id"
          @click="setEdition(edition.id)"
        >
          {{ edition.name }}
        </li>
      </ul>
    </Modal>

    <RoleSelectionModal
      :players="players"
      :roles="roles"
      :is-open="isRoleModalOpen"
      @close="isRoleModalOpen = false"
    ></RoleSelectionModal>

    <div class="controls">
      <font-awesome-icon icon="cogs" @click="isControlOpen = !isControlOpen" />
      <ul v-if="isControlOpen">
        <li @click="togglePublic">Toggle <em>G</em>rimoire</li>
        <li>
          Size
          <font-awesome-icon @click="zoom -= 0.1" icon="search-minus" />
          {{ Math.round(zoom * 100) }}%
          <font-awesome-icon @click="zoom += 0.1" icon="search-plus" />
        </li>
        <li @click="addPlayer" v-if="players.length < 20">
          <em>A</em>dd Player
        </li>
        <li @click="randomizeSeatings" v-if="players.length > 2">
          <em>R</em>andomize Seatings
        </li>
        <li @click="clearPlayers" v-if="players.length">
          Clear Players
        </li>
        <li @click="clearRoles" v-if="players.length">
          Clear Roles
        </li>
        <li @click="showEditionModal" v-if="players.length > 4">
          Select Edition
        </li>
        <li @click="showRoleModal" v-if="players.length > 4">
          Select Roles
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TownSquare from "./components/TownSquare";
import TownInfo from "./components/TownInfo";
import Modal from "./components/Modal";
import RoleSelectionModal from "./components/RoleSelectionModal";
import rolesJSON from "./roles";
import editionJSON from "./editions";

export default {
  components: {
    TownSquare,
    TownInfo,
    Modal,
    RoleSelectionModal
  },
  data: function() {
    return {
      editions: editionJSON,
      isPublic: true,
      isControlOpen: false,
      isEditionModalOpen: false,
      isRoleModalOpen: false,
      players: [],
      roles: this.getRolesByEdition(),
      edition: "tb",
      zoom: 1
    };
  },
  methods: {
    togglePublic() {
      this.isPublic = !this.isPublic;
      this.isControlOpen = false;
    },
    addPlayer() {
      const name = prompt("Player name");
      if (name) {
        this.players.push({
          name,
          role: {},
          reminders: []
        });
      }
    },
    randomizeSeatings() {
      this.isPublic = false;
      this.isControlOpen = false;
      if (confirm("Are you sure you want to randomize seatings?")) {
        this.players = this.players
          .map(a => [Math.random(), a])
          .sort((a, b) => a[0] - b[0])
          .map(a => a[1]);
      }
    },
    clearPlayers() {
      this.isControlOpen = false;
      if (confirm("Are you sure you want to remove all players?")) {
        this.players = [];
      }
    },
    clearRoles() {
      this.isControlOpen = false;
      if (confirm("Are you sure you want to remove all player roles?")) {
        this.players.forEach(player => {
          player.role = {};
          player.reminders = [];
        });
      }
    },
    getRolesByEdition(edition = "tb") {
      const selectedEdition = editionJSON.find(({ id }) => id === edition);
      return new Map(
        rolesJSON
          .filter(
            r => r.edition === edition || selectedEdition.roles.includes(r.id)
          )
          .sort((a, b) => b.team.localeCompare(a.team))
          .map(role => [role.id, role])
      );
    },
    showEditionModal() {
      this.isEditionModalOpen = true;
      this.isPublic = false;
      this.isControlOpen = false;
    },
    setEdition(edition) {
      this.edition = edition;
      this.isEditionModalOpen = false;
    },
    showRoleModal() {
      this.isRoleModalOpen = true;
      this.isPublic = false;
      this.isControlOpen = false;
    },
    keyup({ key }) {
      switch (key) {
        case "g":
          this.togglePublic();
          break;
        case "a":
          this.addPlayer();
          break;
        case "r":
          this.randomizeSeatings();
          break;
      }
    }
  },
  mounted() {
    if (localStorage.isPublic !== undefined) {
      this.isPublic = JSON.parse(localStorage.isPublic);
    }
    if (localStorage.edition) {
      this.edition = localStorage.edition;
      this.roles = this.getRolesByEdition(this.edition);
    }
    if (localStorage.players) {
      this.players = JSON.parse(localStorage.players).map(player => ({
        ...player,
        role: this.roles.get(player.role) || {}
      }));
    }
  },
  watch: {
    players: {
      handler(newPlayers) {
        localStorage.players = JSON.stringify(
          newPlayers.map(player => ({
            ...player,
            role: player.role.id || {}
          }))
        );
      },
      deep: true
    },
    edition(newEdition) {
      localStorage.edition = newEdition;
      this.roles = this.getRolesByEdition(newEdition);
    },
    isPublic(newIsPublic) {
      localStorage.isPublic = JSON.stringify(newIsPublic);
    }
  }
};
</script>

<style lang="scss">
@import "vars";

@font-face {
  font-family: "Papyrus";
  src: url("assets/fonts/papyrus.eot"); /* IE9*/
  src: url("assets/fonts/papyrus.eot?#iefix") format("embedded-opentype"),
    /* IE6-IE8 */ url("assets/fonts/papyrus.woff2") format("woff2"),
    /* chrome firefox */ url("assets/fonts/papyrus.woff") format("woff"),
    /* chrome firefox */ url("assets/fonts/papyrus.ttf") format("truetype"),
    /* chrome firefox opera Safari, Android, iOS 4.2+*/
      url("assets/fonts/papyrus.svg#PapyrusW01") format("svg"); /* iOS 4.1- */
}

html,
body {
  font-size: 1.2em;
  line-height: 1.4;
  background: url("assets/background.jpg") center center;
  background-size: cover;
  color: white;
  height: 100%;
  font-family: "Roboto Condensed", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
  position: relative;
}

#app {
  height: 100%;
}

// Controls
.controls {
  position: absolute;
  right: 0;
  top: 0;
  text-align: right;
  padding: 10px;
  svg {
    cursor: pointer;
  }
  ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px black;
    li {
      padding: 5px 10px;
      color: white;
      text-align: center;
      background: rgba(0, 0, 0, 0.7);
      margin-bottom: 1px;
      cursor: pointer;
      &:hover {
        background-color: red;
      }
      em {
        text-decoration: underline;
        font-style: normal;
        font-weight: bold;
      }
    }
  }
}

// Editions
@each $img in $editions {
  .edition-#{$img} {
    background-image: url("./assets/edition-#{$img}.png");
  }
}

ul.editions .edition {
  text-align: center;
  padding-top: 100px;
  background-position: center center;
  background-size: 100% auto;
  background-repeat: no-repeat;
  width: 200px;
  margin: 5px;
  font-size: 120%;
  font-weight: bold;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000, 0 0 5px rgba(0, 0, 0, 0.75);
  cursor: pointer;
}

// Buttons
.button {
  padding: 0;
  border: solid 0.125em transparent;
  border-radius: 15px;
  box-shadow: inset 0 1px 1px #9c9c9c, 0 0 10px #000;
  background: radial-gradient(
        at 0 -15%,
        rgba(#fff, 0.07) 70%,
        rgba(#fff, 0) 71%
      )
      0 0/ 80% 90% no-repeat content-box,
    linear-gradient(#4e4e4e, #040404) content-box,
    linear-gradient(#292929, #010101) border-box;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
  line-height: 40px;
  margin: 5px auto;
  font-size: 1em;
  cursor: pointer;
  transition: all 200ms;
  &:hover {
    color: red;
  }
  &:disabled {
    color: gray;
  }
  &:before,
  &:after {
    content: " ";
    display: inline-block;
    width: 10px;
    height: 10px;
  }
}
</style>
