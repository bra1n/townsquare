<template>
  <Modal
    class="game-state"
    v-if="modals.gameState"
    @close="toggleModal('gameState')"
  >
    <h3>Current Game State</h3>
    <textarea v-model="gamestate"></textarea>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import { mapMutations, mapState } from "vuex";

export default {
  components: {
    Modal
  },
  computed: {
    gamestate: function() {
      return JSON.stringify({
        bluffs: "",
        edition: "",
        roles: "",
        fabled: "",
        players: ""
      });
    },
    ...mapState(["modals"])
  },
  methods: {
    ...mapMutations(["toggleModal"])
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

h3 {
  margin: 0 40px;
  svg {
    vertical-align: middle;
  }
}
</style>
