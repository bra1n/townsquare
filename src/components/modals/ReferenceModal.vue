<template>
  <Modal
    class="characters"
    @close="toggleModal('reference')"
    v-show="modals.reference && roles.size"
  >
    <font-awesome-icon
      @click="toggleModal('nightOrder')"
      icon="cloud-moon"
      class="nightorder-toggle"
      title="Show Night Order"
    />
    <h3>
      Character Reference
      <font-awesome-icon icon="address-card" />
      {{ edition.name || "Custom Script" }}
    </h3>
    <ul class="legend">
      <li>
        <span class="name">Name</span>
        <span class="icon">Icon</span>
        <span class="ability">Ability</span>
        <span class="player" v-if="Object.keys(playersByRole).length">
          Player
        </span>
      </li>
    </ul>
    <div v-for="(teamRoles, team) in rolesGrouped" :key="team" :class="[team]">
      <h4>{{ team }}</h4>
      <ul>
        <li v-for="role in teamRoles" :class="[team]" :key="role.id">
          <span class="name">{{ role.name }}</span>
          <span
            class="icon"
            v-if="role.id"
            :style="{
              backgroundImage: `url(${role.image ||
                require('../../assets/icons/' + role.id + '.png')})`
            }"
          ></span>
          <span class="ability">{{ role.ability }}</span>
          <span class="player" v-if="Object.keys(playersByRole).length">{{
            playersByRole[role.id] ? playersByRole[role.id].join(", ") : ""
          }}</span>
        </li>
      </ul>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import { mapMutations, mapState } from "vuex";

export default {
  components: {
    Modal
  },
  mounted: function() {
    this.$children[0].isMaximized = true;
  },
  computed: {
    rolesGrouped: function() {
      const rolesGrouped = {};
      this.roles.forEach(role => {
        if (!rolesGrouped[role.team]) {
          rolesGrouped[role.team] = [];
        }
        rolesGrouped[role.team].push(role);
      });
      delete rolesGrouped["traveler"];
      return rolesGrouped;
    },
    playersByRole: function() {
      const players = {};
      this.players.forEach(({ name, role }) => {
        if (role && role.id && role.team !== "traveler") {
          if (!players[role.id]) {
            players[role.id] = [];
          }
          players[role.id].push(name);
        }
      });
      return players;
    },
    ...mapState(["roles", "modals", "edition"]),
    ...mapState("players", ["players"])
  },
  methods: {
    ...mapMutations(["toggleModal"])
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

.nightorder-toggle {
  position: absolute;
  left: 20px;
  top: 20px;
  cursor: pointer;
  &:hover {
    color: red;
  }
}

h3 {
  margin: 0 90px;
  svg {
    vertical-align: middle;
  }
}

h4 {
  text-transform: capitalize;
  display: flex;
  align-items: center;
  height: 12px;
  &:before,
  &:after {
    content: " ";
    width: 100%;
    height: 1px;
    border-radius: 2px;
  }
  &:before {
    margin-right: 15px;
  }
  &:after {
    margin-left: 15px;
  }
}

.townsfolk {
  .name,
  h4 {
    color: $townsfolk;
    &:before,
    &:after {
      background-color: $townsfolk;
    }
  }
}
.outsider {
  .name,
  h4 {
    color: $outsider;
    &:before,
    &:after {
      background-color: $outsider;
    }
  }
}
.minion {
  .name,
  h4 {
    color: $minion;
    &:before,
    &:after {
      background-color: $minion;
    }
  }
}
.demon {
  .name,
  h4 {
    color: $demon;
    &:before,
    &:after {
      background-color: $demon;
    }
  }
}
ul {
  li {
    display: flex;
    width: 100%;
    align-items: center;
    align-content: center;
    /*background: linear-gradient(0deg, #ffffff0f, transparent);*/
    border-radius: 10px;
    .icon {
      width: 6vh;
      background-size: cover;
      background-position: 0 -5px;
      flex-grow: 0;
      flex-shrink: 0;
      margin: 0 10px;
      text-align: center;
      border-left: 1px solid #ffffff1f;
      border-right: 1px solid #ffffff1f;
      &:after {
        content: " ";
        display: block;
        padding-top: 66%;
      }
    }
    .name {
      flex-grow: 0;
      flex-shrink: 0;
      width: 15%;
      font-weight: bold;
      text-align: right;
      font-size: 110%;
    }
    .player {
      flex-grow: 0;
      flex-shrink: 1;
      text-align: right;
      margin: 0 10px;
      color: #888;
      font-size: smaller;
    }
    .ability {
      flex-grow: 1;
    }
  }
  &.legend {
    font-weight: bold;
    height: 20px;
    margin-top: 10px;
    li span {
      background: none;
      height: auto;
      font-family: inherit;
      font-size: inherit;
      color: #fff;
    }
    .icon:after {
      padding-top: 0;
    }
  }
}
</style>
