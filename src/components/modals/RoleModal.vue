<template>
  <Modal v-if="isDisplayed" @close="close">
    <h3>
      Choose a new character for
      {{
        playerIndex >= 0 && players.length
          ? players[playerIndex].name
          : "bluffing"
      }}
    </h3>
    <ul class="tokens">
      <li
        v-for="role in displayedRoles"
        :class="[role.team, { match: queryMatches(role.name) }]"
        :key="role.id"
        @click="setRole(role)"
      >
        <Token :role="role" />
      </li>
    </ul>
    <div
      class="button-group"
      v-if="playerIndex >= 0 && otherTravelers.size && !session.isSpectator"
    >
      <span
        class="button"
        :class="{ townsfolk: tab === 'editionRoles' }"
        @click="tab = 'editionRoles'"
        >Edition Roles</span
      >
      <span
        class="button"
        :class="{ townsfolk: tab === 'otherTravelers' }"
        @click="tab = 'otherTravelers'"
        >Other Travelers</span
      >
    </div>
    <input
      ref="searchInput"
      class="role-search"
      placeholder="Search"
      v-model="query"
      @keyup="keyup"
    />
  </Modal>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import Token from "../Token";

export default {
  components: { Token, Modal },
  props: ["playerIndex"],
  computed: {
    availableRoles() {
      const availableRoles = [];
      const players = this.$store.state.players.players;
      this.$store.state.roles.forEach(role => {
        // don't show bluff roles that are already assigned to players
        if (
          this.playerIndex >= 0 ||
          (this.playerIndex < 0 &&
            !players.some(player => player.role.id === role.id))
        ) {
          availableRoles.push(role);
        }
      });
      availableRoles.push({});
      return availableRoles;
    },
    isDisplayed() {
      return this.modals.role && this.availableRoles.length;
    },
    displayedRoles() {
      if (this.tab === "editionRoles" || !this.otherTravelers.size)
        return this.availableRoles;
      else return [...this.otherTravelers.values()];
    },
    ...mapState(["modals", "roles", "session"]),
    ...mapState("players", ["players"]),
    ...mapState(["otherTravelers"])
  },
  data() {
    return {
      tab: "editionRoles",
      query: ""
    };
  },
  methods: {
    setRole(role) {
      if (this.playerIndex < 0) {
        // assign to bluff slot (index < 0)
        this.$store.commit("players/setBluff", {
          index: this.playerIndex * -1 - 1,
          role
        });
      } else {
        if (this.session.isSpectator && role.team === "traveler") return;
        // assign to player
        const player = this.$store.state.players.players[this.playerIndex];
        this.$store.commit("players/update", {
          player,
          property: "role",
          value: role
        });
      }
      this.reset();
      this.$store.commit("toggleModal", "role");
    },
    close() {
      this.reset();
      this.toggleModal("role");
    },
    reset() {
      this.tab = "editionRoles";
      this.query = "";
    },
    queryMatches(name) {
      const simplify = str => str.replaceAll(/\W+/g, "").toLowerCase();
      return simplify(name || "").startsWith(simplify(this.query));
    },
    keyup(event) {
      // Allow Escape for modal dialog dismissal.
      if (event.key == "Esc" || event.key == "Escape") return;

      event.stopPropagation();
      if (event.key == "Enter") {
        const matchingRoles = this.displayedRoles.filter(r =>
          this.queryMatches(r.name)
        );
        if (matchingRoles.length === 1) this.setRole(matchingRoles[0]);
      }
    },
    ...mapMutations(["toggleModal"])
  },
  watch: {
    isDisplayed(shown) {
      if (shown) this.$nextTick(() => this.$refs.searchInput.focus());
    }
  }
};
</script>

<style scoped lang="scss">
@import "../../vars.scss";

ul.tokens li {
  border-radius: 50%;
  width: 6vw;
  margin: 1%;
  transition: transform 500ms ease;

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
  &:not(.match) {
    opacity: 0.4;
  }
}

#townsquare.spectator ul.tokens li.traveler {
  display: none;
}

input.role-search {
  display: block;
  width: 100%;
  background: transparent;
  border: solid white;
  border-width: 0 0 1px 0;
  outline: none;
  color: white;
  font-size: 1em;

  &:not(:focus) {
    border-bottom-color: #777;
  }
}
</style>
