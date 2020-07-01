<template>
  <Modal
    class="characters"
    v-show="modals.reference"
    @close="toggleModal('reference')"
    v-if="roles.size"
  >
    <template v-if="!isNightOrder">
      <font-awesome-icon
        @click="isNightOrder = !isNightOrder"
        icon="cloud-moon"
        class="toggle"
        title="Show Night Order"
      />
      <h3>
        Character Reference
        <font-awesome-icon icon="address-card" />
        {{ editionName }}
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
      <div
        v-for="(teamRoles, team) in rolesGrouped"
        :key="team"
        :class="[team]"
      >
        <h4>{{ team }}</h4>
        <ul>
          <li v-for="role in teamRoles" :class="[team]" :key="role.id">
            <span class="name">{{ role.name }}</span>
            <span
              class="icon"
              v-if="role.id"
              v-bind:style="{
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
    </template>
    <template v-else>
      <font-awesome-icon
        @click="isNightOrder = !isNightOrder"
        icon="address-card"
        class="toggle"
        title="Show Character Reference"
      />
      <h3>
        Night Order
        <font-awesome-icon icon="cloud-moon" />
        {{ editionName }}
      </h3>
      <div class="night">
        <ul class="first">
          <li class="headline">First Night</li>
          <li
            v-for="role in rolesFirstNight"
            :key="role.id"
            :class="[role.team]"
          >
            <span class="name">
              {{ role.name }}
            </span>
            <span
              class="icon"
              v-if="role.id"
              v-bind:style="{
                backgroundImage: `url(${require('../../assets/icons/' +
                  role.id +
                  '.png')})`
              }"
            ></span>
          </li>
        </ul>
        <ul class="other">
          <li class="headline">Other Nights</li>
          <li
            v-for="role in rolesOtherNight"
            :key="role.id"
            :class="[role.team]"
          >
            <span
              class="icon"
              v-if="role.id"
              v-bind:style="{
                backgroundImage: `url(${require('../../assets/icons/' +
                  role.id +
                  '.png')})`
              }"
            ></span>
            <span class="name">
              {{ role.name }}
            </span>
          </li>
        </ul>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import editionJSON from "./../../editions.json";
import { mapMutations, mapState } from "vuex";

export default {
  components: {
    Modal
  },
  data: function() {
    return {
      roleSelection: {},
      isNightOrder: false
    };
  },
  computed: {
    editionName: function() {
      const edition = editionJSON.find(({ id }) => id === this.edition);
      return edition ? edition.name : "Custom Script";
    },
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
    rolesFirstNight: function() {
      const rolesFirstNight = [];
      this.roles.forEach(role => {
        if (role.firstNight) {
          rolesFirstNight.push(role);
        }
      });
      rolesFirstNight.sort((a, b) => a.firstNight - b.firstNight);
      return rolesFirstNight;
    },
    rolesOtherNight: function() {
      const rolesOtherNight = [];
      this.roles.forEach(role => {
        if (role.otherNight) {
          rolesOtherNight.push(role);
        }
      });
      rolesOtherNight.sort((a, b) => a.otherNight - b.otherNight);
      return rolesOtherNight;
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

.toggle {
  position: absolute;
  left: 20px;
  top: 20px;
  cursor: pointer;
  &:hover {
    color: red;
  }
}

h3 {
  margin: 0 40px;
  svg {
    vertical-align: middle;
  }
}

h4 {
  text-transform: capitalize;
  display: flex;
  align-items: center;
  height: 20px;
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
  .player,
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
  .player,
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
  .player,
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
  .player,
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
      font-family: "Papyrus", sans-serif;
      font-size: 110%;
    }
    .player {
      flex-grow: 0;
      flex-shrink: 1;
      text-align: right;
      margin: 0 10px;
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
    }
    .icon:after {
      padding-top: 0;
    }
  }
}

.night {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  > *:first-child {
    margin-right: 2vh;
  }
  > * {
    flex-grow: 0;
    flex-wrap: nowrap;
    flex-direction: column;
  }
  .headline {
    display: block;
    font-weight: bold;
    border-bottom: 1px solid white;
    padding: 5px 10px;
    border-radius: 0;
    text-align: center;
  }
  .icon {
    border-color: white;
  }
  .name {
    flex-grow: 1;
  }
  .first {
    .icon {
      border-right: 0;
    }
  }
  .other {
    li .name {
      text-align: left;
    }
    .icon {
      border-left: 0;
    }
  }
}
</style>
