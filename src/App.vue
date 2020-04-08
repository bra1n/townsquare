<template>
  <div id="app">
    <TownInfo :players="players"></TownInfo>
    <TownSquare
      :is-public="isPublic"
      :players="players"
      :roles="roles"
    ></TownSquare>
    <div class="controls">
      <font-awesome-icon icon="cogs" @click="isControlOpen = !isControlOpen"/>
      <ul v-if="isControlOpen">
        <li v-on:click="togglePublic">
          Toggle Grimoire
        </li>
        <li v-on:click="addPlayer" v-if="players.length < 20">
          Add Player
        </li>
        <li v-on:click="togglePublic" v-if="players.length > 4">
          Select Roles
        </li>
        <li v-on:click="randomizeSeatings" v-if="players.length > 2">
          Randomize Seatings
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TownSquare from "./components/TownSquare";
import TownInfo from "./components/TownInfo";
import rolesJSON from "./roles";

const roles = new Map(
  rolesJSON
    .filter(r => r.set === (window.location.hash.substr(1) || "TB"))
    .sort((a, b) => b.team.localeCompare(a.team))
    .map(role => [role.id, role])
);

export default {
  components: {
    TownSquare,
    TownInfo
  },
  data: () => ({
    isPublic: true,
    isControlOpen: false,
    players: [
      // {
      //   name: "Steffen",
      //   role: roles.get("baron"),
      //   reminders: [{ role: "imp", name: "Die" }]
      // },
      // { name: "Tino", role: roles.get("beggar"), reminders: [] },
      // { name: "Basti", role: roles.get("chef"), reminders: [] },
      // { name: "Bernd", role: roles.get("ravenkeeper"), reminders: [] },
      // { name: "Tim", role: roles.get("drunk"), reminders: [] },
      // { name: "Yann", role: roles.get("librarian"), reminders: [] },
      // { name: "Marie", role: roles.get("empath"), reminders: [] },
      // { name: "Bogdan", role: roles.get("scarletwoman"), reminders: [] },
      // { name: "Sean", role: roles.get("recluse"), reminders: [] },
      // { name: "Petra", role: roles.get("undertaker"), reminders: [] }
    ],
    roles,
    set: "TB"
  }),
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
      if (confirm("Are you sure you want to randomize seatings?")) {
        this.players = this.players
          .map(a => [Math.random(), a])
          .sort((a, b) => a[0] - b[0])
          .map(a => a[1]);
      }
    }
  }
};
</script>

<style lang="scss">
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
    }
  }
}
</style>
