<template>
  <Modal
    class="roles"
    v-if="modals.roles && nonTravelers >= 5"
    @close="toggleModal('roles')"
  >
    <h3>Select the characters for {{ nonTravelers }} players:</h3>
    <ul
      class="tokens"
      v-for="(teamRoles, team) in roleSelection"
      v-bind:key="team"
    >
      <li class="count" v-bind:class="[team]">
        {{ teamRoles.filter(role => role.selected).length }} /
        {{ game[nonTravelers - 5][team] }}
      </li>
      <li
        v-for="role in teamRoles"
        v-bind:class="[role.team, role.selected ? 'selected' : '']"
        v-bind:key="role.id"
        @click="role.selected = !role.selected"
      >
        <Token :role="role" />
      </li>
    </ul>
    <div class="warning" v-if="hasSelectedSetupRoles">
      Warning: there are characters selected that modify the game setup! The
      randomizer does not account for these characters.
    </div>
    <div class="button-group">
      <div
        class="button"
        @click="assignRoles"
        v-bind:class="{
          disabled: selectedRoles > nonTravelers || !selectedRoles
        }"
      >
        <font-awesome-icon icon="people-arrows" />
        Assign {{ selectedRoles }} characters randomly
      </div>
      <div class="button" @click="selectRandomRoles">
        <font-awesome-icon icon="random" />
        Shuffle characters
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import gameJSON from "./../../game";
import Token from "./../Token";
import { mapGetters, mapMutations, mapState } from "vuex";

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

export default {
  components: {
    Token,
    Modal
  },
  data: function() {
    return {
      roleSelection: {},
      game: gameJSON
    };
  },
  computed: {
    selectedRoles: function() {
      return Object.values(this.roleSelection)
        .map(roles => roles.filter(role => role.selected).length)
        .reduce((a, b) => a + b, 0);
    },
    hasSelectedSetupRoles: function() {
      return Object.values(this.roleSelection).some(roles =>
        roles.some(role => role.selected && role.setup)
      );
    },
    ...mapState(["roles", "modals"]),
    ...mapState("players", ["players"]),
    ...mapGetters({ nonTravelers: "players/nonTravelers" })
  },
  methods: {
    selectRandomRoles() {
      this.roleSelection = {};
      this.roles.forEach(role => {
        if (!this.roleSelection[role.team]) {
          this.$set(this.roleSelection, role.team, []);
        }
        this.roleSelection[role.team].push(role);
        this.$set(role, "selected", false);
      });
      delete this.roleSelection["traveler"];
      const playerCount = Math.max(5, this.nonTravelers);
      const composition = this.game[playerCount - 5];
      Object.keys(composition).forEach(team => {
        for (let x = 0; x < composition[team]; x++) {
          if (this.roleSelection[team]) {
            const available = this.roleSelection[team].filter(
              role => role.selected !== true
            );
            if (available.length) {
              randomElement(available).selected = true;
            }
          }
        }
      });
    },
    assignRoles() {
      if (this.selectedRoles <= this.nonTravelers && this.selectedRoles) {
        // generate list of selected roles and randomize it
        const roles = Object.values(this.roleSelection)
          .map(roles => roles.filter(role => role.selected))
          .reduce((a, b) => [...a, ...b], [])
          .map(a => [Math.random(), a])
          .sort((a, b) => a[0] - b[0])
          .map(a => a[1]);
        this.players.forEach(player => {
          if (player.role.team !== "traveler" && roles.length) {
            const value = roles.pop();
            this.$store.commit("players/update", {
              player,
              property: "role",
              value
            });
          }
        });
        this.$store.commit("toggleModal", "roles");
      }
    },
    ...mapMutations(["toggleModal"])
  },
  mounted: function() {
    if (!Object.keys(this.roleSelection).length) {
      this.selectRandomRoles();
    }
  },
  watch: {
    roles() {
      this.selectRandomRoles();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

ul.tokens {
  padding-left: 5%;
  li {
    border-radius: 50%;
    width: 6vw;
    margin: 1%;
    opacity: 0.5;
    transition: all 250ms;
    &.selected {
      opacity: 1;
    }
    &.townsfolk {
      box-shadow: 0 0 10px $townsfolk, 0 0 10px #004cff;
    }
    &.outsider {
      box-shadow: 0 0 10px $outsider, 0 0 10px $outsider;
    }
    &.minion {
      box-shadow: 0 0 10px $minion, 0 0 10px $minion;
    }
    &.demon {
      box-shadow: 0 0 10px $demon, 0 0 10px $demon;
    }
    &.traveler {
      box-shadow: 0 0 10px $traveler, 0 0 10px $traveler;
    }
    &:hover {
      transform: scale(1.2);
      z-index: 10;
    }
  }
  .count {
    opacity: 1;
    position: absolute;
    left: 0;
    font-weight: bold;
    font-size: 75%;
    width: 5%;
    display: flex;
    align-items: center;
    justify-content: center;
    &:after {
      content: " ";
      display: block;
      padding-top: 100%;
    }
    &.townsfolk {
      color: $townsfolk;
    }
    &.outsider {
      color: $outsider;
    }
    &.minion {
      color: $minion;
    }
    &.demon {
      color: $demon;
    }
  }
}

.roles .modal .warning {
  color: red;
  text-align: center;
  margin: auto;
}
</style>
