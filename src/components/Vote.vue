<template>
  <div class="vote">
    <div class="arrows">
      <span class="nominee" :style="nomineeStyle"></span>
      <span class="nominator" :style="nominatorStyle"></span>
    </div>
    <div class="overlay">
      <em class="blue">{{ nominator.name }}</em> nominated
      <em>{{ nominee.name }}</em
      >!
      <br />
      <template v-if="nominee.role.team !== 'traveler'">
        <em class="blue">{{ Math.ceil(alive / 2) }} votes</em> required for an
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
    nominatorStyle: function() {
      const players = this.$store.state.players.players.length;
      const nomination = this.$store.state.session.nomination[0];
      return {
        transform: `rotate(${Math.round((nomination / players) * 360)}deg)`
      };
    },
    nominee: function() {
      return this.$store.state.players.players[
        this.$store.state.session.nomination[1]
      ];
    },
    nomineeStyle: function() {
      const players = this.$store.state.players.players.length;
      const nomination = this.$store.state.session.nomination[1];
      return {
        transform: `rotate(${Math.round((nomination / players) * 360)}deg)`
      };
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
  width: 20%;
  z-index: 20;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  background: url("../assets/demon-head.png") center center no-repeat;
  background-size: auto 75%;
  text-align: center;
  text-shadow: 0 1px 2px #000000, 0 -1px 2px #000000, 1px 0 2px #000000,
    -1px 0 2px #000000;

  &:after {
    content: " ";
    padding-bottom: 100%;
    display: block;
  }

  em {
    color: $demon;
    font-style: normal;
    font-weight: bold;
    &.blue {
      color: $townsfolk;
    }
  }
}

@keyframes arrow-cw {
  0% {
    opacity: 0;
    transform: rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: rotate(0deg);
  }
}

@keyframes arrow-ccw {
  0% {
    opacity: 0;
    transform: rotate(180deg);
  }
  100% {
    opacity: 1;
    transform: rotate(0deg);
  }
}

.arrows {
  position: absolute;
  display: flex;
  height: 150%;
  width: 20%;
  span {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  span:before {
    content: " ";
    width: 100%;
    height: 100%;
    display: block;
    background-size: auto 100%;
    background-repeat: no-repeat;
    background-position: center center;
    position: absolute;
    filter: drop-shadow(0px 0px 3px #000);
  }
  .nominator:before {
    background-image: url("../assets/clock-small.png");
    animation: arrow-ccw 1s ease-out;
  }
  .nominee:before {
    background-image: url("../assets/clock-big.png");
    animation: arrow-cw 1s ease-out;
  }
}
</style>
