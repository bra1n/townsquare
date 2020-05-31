<template>
  <div class="vote">
    <div class="arrows">
      <span class="nominator"></span>
      <span class="nominee"></span>
    </div>
    <div class="overlay">
      <em>{{ nominator.name }}</em> nominated <em>{{ nominee.name }}</em
      >!
      <br />
      <template v-if="nominee.role.team !== 'traveler'">
        <em>{{ Math.ceil(alive / 2) }} votes</em> required for an
        <em>execution</em>
      </template>
      <template v-else>
        <em>{{ Math.ceil(players.length / 2) }} votes</em> required for an
        <em>exile</em>
      </template>
      <div class="button-group">
        <div class="button">Start Vote</div>
        <div class="button" @click="finish">Finish Vote</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  computed: {
    nominator: function() {
      return this.$store.state.players.players[
        this.$store.state.session.nomination[0]
      ];
    },
    nominee: function() {
      return this.$store.state.players.players[
        this.$store.state.session.nomination[1]
      ];
    },
    ...mapState("players", ["players"]),
    ...mapState(["session"]),
    ...mapGetters({ alive: "players/alive" })
  },
  methods: {
    finish() {
      this.$store.commit("session/nomination", false);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../vars.scss";

.vote {
  position: absolute;
  height: 300px;
  width: 300px;
  z-index: 20;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  background: url("../assets/demon-head.png") center center no-repeat;
  background-size: auto 100%;
  text-align: center;
  text-shadow: 0 1px 2px #000000, 0 -1px 2px #000000, 1px 0 2px #000000,
    -1px 0 2px #000000;

  em {
    color: red;
    font-style: normal;
    font-weight: bold;
  }
}
</style>
