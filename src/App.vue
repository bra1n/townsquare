<template>
  <div id="app">
    <ul class="info">
      <li>
        {{ players.length }} <font-awesome-icon icon="users" />
        {{ teams.alive }} <font-awesome-icon icon="heartbeat" />
        {{ teams.votes }} <font-awesome-icon icon="vote-yea" />
      </li>
      <li>
        {{ teams.townsfolk }}
        <span class="townsfolk"><font-awesome-icon icon="user-friends"/></span>
        {{ teams.outsiders }}
        <span class="outsider"><font-awesome-icon v-bind:icon="teams.outsiders > 1 ? 'user-friends' : 'user'"/></span>
        {{ teams.minions }}
        <span class="minion"><font-awesome-icon v-bind:icon="teams.minions > 1 ? 'user-friends' : 'user'"/></span>
        {{ teams.demons }}
        <span class="demon"><font-awesome-icon v-bind:icon="teams.demons > 1 ? 'user-friends' : 'user'"/></span>
        <template v-if="teams.travellers">
          {{ teams.travellers }}
          <span class="traveller"
            ><font-awesome-icon v-bind:icon="teams.travellers > 1 ? 'user-friends' : 'user'"/></span>
        </template>
      </li>
    </ul>
    <TownSquare
      v-if="players.length >= 5"
      :is-public="isPublic"
      :players="players"
      :roles="roles"
    ></TownSquare>
    <div class="controls">
      <button v-on:click="togglePublic">Toggle</button>
      <button v-on:click="addPlayer" v-bind:disabled="players.length >= 20">
        Add Player
      </button>
      <button v-on:click="togglePublic" v-bind:disabled="players.length <= 0">
        Remove Player
      </button>
      <button v-on:click="togglePublic">Select Roles</button>
      <button v-on:click="togglePublic">Randomize Roles</button>
    </div>
  </div>
</template>

<script>
import TownSquare from "./components/TownSquare.vue";
import rolesJSON from "./roles";
import gameJSON from "./game";

const roles = new Map(
  rolesJSON
    .sort((a, b) => b.team.localeCompare(a.team))
    .map(role => [role.id, role])
);

export default {
  components: {
    TownSquare
  },
  computed: {
    teams: function() {
      const nontravellers = this.players.filter(
        player => player.role.team !== "traveller"
      ).length;
      const alive = this.players.filter(player => player.hasDied !== true)
        .length;
      return {
        ...gameJSON[nontravellers - 5],
        travellers: this.players.length - nontravellers,
        alive,
        votes:
          alive +
          this.players.filter(
            player => player.hasDied === true && player.hasVoted !== true
          ).length
      };
    }
  },
  data: () => ({
    isPublic: true,
    players: [
      {
        name: "Steffen",
        role: roles.get("baron"),
        reminders: [{ role: "imp", name: "Die" }]
      },
      { name: "Tino", role: roles.get("harlot"), reminders: [] },
      { name: "Basti", role: roles.get("chef"), reminders: [] },
      { name: "Bernd", role: roles.get("ravenkeeper"), reminders: [] },
      { name: "Tim", role: roles.get("drunk"), reminders: [] },
      { name: "Yann", role: roles.get("librarian"), reminders: [] },
      { name: "Marie", role: roles.get("empath"), reminders: [] },
      { name: "Bogdan", role: roles.get("scarletwoman"), reminders: [] },
      { name: "Sean", role: roles.get("recluse"), reminders: [] },
      { name: "Petra", role: roles.get("undertaker"), reminders: [] }
    ],
    roles,
    set: "TB"
  }),
  methods: {
    togglePublic() {
      this.isPublic = !this.isPublic;
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
    }
  }
};
</script>

<style lang="scss">
@import "vars.scss";

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
}

.info {
  position: absolute;
  display: flex;
  left: 50%;
  top: 50%;
  width: 20%;
  height: 20%;
  margin-left: -10%;
  margin-top: -5%;
  padding: 0;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  background: url("assets/demon-head.png") center center no-repeat;
  background-size: auto 100%;

  li {
    display: block;
    white-space: nowrap;
    font-weight: bold;
    text-shadow: 0 0 2px black;
    text-align: center;
    padding: 0 5px;
    width: 100%;

    svg {
      margin-right: 10px;
    }

    .townsfolk {
      color: $townsfolk;
    }
    .outsider {
      color: $outsider;
    }
    .minion {
      color: $minion;
    }
    .demon {
      color: $demon;
    }
    .traveller {
      color: $traveller;
    }
    .alive,
    .votes {
      color: #aaa;
    }
  }
}
</style>
