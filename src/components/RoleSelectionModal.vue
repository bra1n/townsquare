<template>
  <Modal class="roles" v-show="isOpen" @close="close()">
    <h2>Select the roles for {{ nontravelerPlayers }} players:</h2>
    <ul
      class="tokens"
      v-for="(teamRoles, team) in roleSelection"
      v-bind:key="team"
    >
      <li class="count" v-bind:class="[team]">
        {{ teamRoles.filter(role => role.selected).length }} /
        {{ game[nontravelerPlayers - 5][team] }}
      </li>
      <li
        v-for="role in teamRoles"
        class="token"
        v-bind:class="[role.id, role.team, role.selected ? 'selected' : '']"
        v-bind:key="role.id"
        @click="role.selected = !role.selected"
      >
        {{ role.name }}
      </li>
    </ul>
    <button
      @click="assignRoles()"
      v-bind:disabled="selectedRoles > nontravelerPlayers || !selectedRoles"
    >
      Assign {{ selectedRoles }} roles randomly
    </button>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import gameJSON from "./../game";

const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

export default {
  components: {
    Modal
  },
  props: {
    players: {
      type: Array,
      required: true
    },
    roles: {
      type: Map,
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      roleSelection: {},
      game: gameJSON
    };
  },
  computed: {
    nontravelerPlayers: function() {
      return Math.min(
        this.players.filter(({ role }) => role && role.team !== "traveler").length,
        15
      );
    },
    selectedRoles: function() {
      return Object.values(this.roleSelection)
        .map(roles => roles.filter(role => role.selected).length)
        .reduce((a, b) => a + b, 0);
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    showRoleSelectionModal() {
      this.roleSelection = {};
      this.roles.forEach(role => {
        if (!this.roleSelection[role.team]) {
          this.$set(this.roleSelection, role.team, []);
        }
        this.roleSelection[role.team].push(role);
        this.$set(role, "selected", false);
      });
      delete this.roleSelection["traveler"];
      const playerCount = Math.max(5, this.nontravelerPlayers);
      const composition = this.game[playerCount - 5];
      Object.keys(composition).forEach(team => {
        for (let x = 0; x < composition[team]; x++) {
          const available = this.roleSelection[team].filter(
            role => role.selected !== true
          );
          if (available.length) {
            randomElement(available).selected = true;
          }
        }
      });
    },
    assignRoles() {
      // generate list of selected roles and randomize it
      const roles = Object.values(this.roleSelection)
        .map(roles => roles.filter(role => role.selected))
        .reduce((a, b) => [...a, ...b], [])
        .map(a => [Math.random(), a])
        .sort((a, b) => a[0] - b[0])
        .map(a => a[1]);
      this.players.forEach(player => {
        if (player.role.team !== "traveler" && roles.length) {
          player.role = roles.pop();
        }
      });
      this.close();
    }
  },
  watch: {
    isOpen(newIsOpen) {
      if (newIsOpen) {
        this.showRoleSelectionModal();
      }
    }
  }
};
</script>

<style lang="scss">
@import "../vars.scss";

.roles .modal ul.tokens {
  padding-left: 20px;
  .count {
    position: absolute;
    left: 0;
    font-weight: bold;
    padding: 5px;
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
  .token {
    opacity: 0.5;
    &.selected {
      opacity: 1;
    }
  }
}
</style>
