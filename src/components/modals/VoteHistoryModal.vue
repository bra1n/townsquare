<template>
  <Modal
    class="vote-history"
    v-show="modals.voteHistory && session.voteHistory"
    @close="toggleModal('voteHistory')"
  >
    <font-awesome-icon
      @click="clearVoteHistory"
      icon="trash-alt"
      class="clear"
      title="Clear history"
    />

    <h3>Nomination history</h3>
    <table>
      <thead>
        <tr>
          <td>Nominator</td>
          <td>Nominee</td>
          <td>Type</td>
          <td>Votes</td>
          <td><font-awesome-icon icon="hand-paper" /> Hand up</td>
          <td>Passed</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(vote, index) in session.voteHistory" :key="index">
          <td>{{ vote.nominator }}</td>
          <td>{{ vote.nominee }}</td>
          <td>{{ vote.type }}</td>
          <td><strong>{{ vote.votes.length }}</strong> / {{ vote.majority }}</td>
          <td>
            <font-awesome-icon icon="user-friends" />
            {{ vote.votes.join(", ") }}
          </td>
          <td>
            <font-awesome-icon icon="check-square" v-if="vote.votes.length >= vote.majority" />
          </td>
        </tr>
      </tbody>
    </table>
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
    ...mapState(["session", "modals"])
  },
  methods: {
    ...mapMutations(["toggleModal"]),
    ...mapMutations("session", ["clearVoteHistory"])
  }
};
</script>

<style lang="scss" scoped>
@import "../../vars.scss";

.clear {
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

table {
  border-spacing: 10px 0;
}

thead td {
  font-weight: bold;
  border-bottom: 1px solid white;
  text-align: center;
  padding: 0 3px;
}

tbody {
  td:nth-child(1) {
    color: $townsfolk;
  }
  td:nth-child(2) {
    color: $demon;
  }
  td:nth-child(4) {
    text-align: center;
  }
  td:nth-child(6) {
    text-align: center;
  }
}
</style>
