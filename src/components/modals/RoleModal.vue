<template>
  <Modal
    v-show="modals.role && availableRoles.length"
    @close="toggleModal('role')"
  >
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
        v-for="role in availableRoles"
        v-bind:class="[role.team]"
        v-bind:key="role.id"
        @click="setRole(role)"
      >
        <Token :role="role" />
      </li>
    </ul>
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
    ...mapState(["modals", "roles", "session"]),
    ...mapState("players", ["players"])
  },
  methods: {
    setRole(role) {
      if (this.playerIndex < 0) {
        // assign to bluff slot
        this.$store.commit("setBluff", {
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
      this.$store.commit("toggleModal", "role");
    },
    ...mapMutations(["toggleModal"])
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
}

#townsquare.spectator ul.tokens li.traveler {
  display: none;
}
</style>
