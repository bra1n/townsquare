<template>
  <Modal
    class="night-reference"
    @close="toggleModal('nightOrder')"
    v-if="modals.nightOrder && roles.size"
  >
    <font-awesome-icon
      @click="toggleModal('reference')"
      icon="address-card"
      class="toggle"
      title="Show Character Reference"
    />
    <h3>
      Night Order
      <font-awesome-icon icon="cloud-moon" />
      {{ edition.name || "Custom Script" }}
    </h3>
    <div class="night">
      <ul class="first">
        <li class="headline">First Night</li>
        <li
          v-for="role in rolesFirstNight"
          :key="role.name"
          :class="[role.team]"
        >
          <span class="name">
            {{ role.name }}
          </span>
          <span
            class="icon"
            v-if="role.id"
            :style="{
              backgroundImage: `url(${role.image ||
                require('../../assets/icons/' + role.id + '.png')})`
            }"
          ></span>
        </li>
      </ul>
      <ul class="other">
        <li class="headline">Other Nights</li>
        <li
          v-for="role in rolesOtherNight"
          :key="role.name"
          :class="[role.team]"
        >
          <span
            class="icon"
            v-if="role.id"
            :style="{
              backgroundImage: `url(${role.image ||
                require('../../assets/icons/' + role.id + '.png')})`
            }"
          ></span>
          <span class="name">
            {{ role.name }}
          </span>
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
  data: function() {
    return {
      roleSelection: {}
    };
  },
  computed: {
    rolesFirstNight: function() {
      const rolesFirstNight = [];
      // add minion / demon infos to night order sheet
      if (this.players.length > 6) {
        rolesFirstNight.push(
          {
            id: "evil",
            name: "Minion info",
            firstNight: 2,
            team: "minion"
          },
          {
            id: "evil",
            name: "Demon info & bluffs",
            firstNight: 4,
            team: "demon"
          }
        );
      }
      this.roles.forEach(role => {
        if (
          role.firstNight &&
          (role.team !== "traveler" ||
            this.players.some(p => p.role.id === role.id))
        ) {
          rolesFirstNight.push(role);
        }
      });
      this.fabled
        .filter(({ firstNight }) => firstNight)
        .forEach(fabled => {
          rolesFirstNight.push(fabled);
        });
      rolesFirstNight.sort((a, b) => a.firstNight - b.firstNight);
      return rolesFirstNight;
    },
    rolesOtherNight: function() {
      const rolesOtherNight = [];
      this.roles.forEach(role => {
        if (
          role.otherNight &&
          (role.team !== "traveler" ||
            this.players.some(p => p.role.id === role.id))
        ) {
          rolesOtherNight.push(role);
        }
      });
      this.fabled
        .filter(({ otherNight }) => otherNight)
        .forEach(fabled => {
          rolesOtherNight.push(fabled);
        });
      rolesOtherNight.sort((a, b) => a.otherNight - b.otherNight);
      return rolesOtherNight;
    },
    ...mapState(["roles", "modals", "edition", "grimoire"]),
    ...mapState("players", ["players", "fabled"])
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

.fabled {
  .name,
  .player,
  h4 {
    color: $fabled;
    &:before,
    &:after {
      background-color: $fabled;
    }
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
