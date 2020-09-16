<template>
  <div id="vote">
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
        <em class="blue">
          {{ voters.length }} vote{{ voters.length !== 1 ? "s" : "" }}
        </em>
        in favor
        <em>(majority is {{ Math.ceil(alive / 2) }})</em>
      </template>
      <template v-else>
        <em>{{ Math.ceil(players.length / 2) }} votes</em> required for a
        <em>majority</em>.
      </template>

      <div v-if="session.lockedVote > 1">
        <em class="blue" v-if="voters.length">{{ voters.join(", ") }} </em>
        <span v-else>nobody</span>
        voted <em>YES</em>
      </div>

      <template v-if="!session.isSpectator">
        <div v-if="!session.lockedVote">
          Vote time per player:
          <font-awesome-icon
            @mousedown.prevent="setVotingSpeed(-1)"
            icon="minus-circle"
          />
          {{ session.votingSpeed }}s
          <font-awesome-icon
            @mousedown.prevent="setVotingSpeed(1)"
            icon="plus-circle"
          />
        </div>
        <div class="button-group">
          <div class="button" v-if="!session.lockedVote" @click="start">
            Start Vote
          </div>
          <div class="button" v-else @click="stop">
            Reset Vote
          </div>
          <div class="button" @click="finish">Finish</div>
        </div>
      </template>
      <template v-else-if="canVote">
        <div v-if="!session.lockedVote">
          {{ session.votingSpeed }} seconds between votes
        </div>
        <div class="button-group">
          <div class="button vote-no" @click="vote(false)">Vote NO</div>
          <div class="button vote-yes" @click="vote(true)">Vote YES</div>
        </div>
      </template>
      <div v-else-if="!player">
        Please claim a seat to vote.
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  computed: {
    ...mapState("players", ["players"]),
    ...mapState(["session"]),
    ...mapGetters({ alive: "players/alive" }),
    nominator: function() {
      return this.players[this.session.nomination[0]];
    },
    nominatorStyle: function() {
      const players = this.players.length;
      const nomination = this.session.nomination[0];
      return {
        transform: `rotate(${Math.round((nomination / players) * 360)}deg)`,
        transitionDuration: this.session.votingSpeed - 0.1 + "s"
      };
    },
    nominee: function() {
      return this.players[this.session.nomination[1]];
    },
    nomineeStyle: function() {
      const players = this.players.length;
      const nomination = this.session.nomination[1];
      const lock = this.session.lockedVote;
      const rotation = (360 * (nomination + Math.min(lock, players))) / players;
      return {
        transform: `rotate(${Math.round(rotation)}deg)`,
        transitionDuration: this.session.votingSpeed - 0.1 + "s"
      };
    },
    player: function() {
      return this.players.find(p => p.id === this.session.playerId);
    },
    canVote: function() {
      if (!this.player) return false;
      if (this.player.isVoteless && this.nominee.role.team !== "traveler")
        return false;
      const session = this.session;
      const players = this.players.length;
      const index = this.players.indexOf(this.player);
      const indexAdjusted =
        (index - 1 + players - session.nomination[1]) % players;
      return indexAdjusted >= session.lockedVote - 1;
    },
    voters: function() {
      const nomination = this.session.nomination[1];
      const voters = this.session.votes.map((vote, index) =>
        vote ? this.players[index].name : ""
      );
      const reorder = [
        ...voters.slice(nomination + 1, this.players.length),
        ...voters.slice(0, nomination + 1)
      ];
      return reorder.slice(0, this.session.lockedVote - 1).filter(n => !!n);
    }
  },
  methods: {
    start() {
      this.$store.commit("session/lockVote");
      clearInterval(this.voteTimer);
      this.voteTimer = setInterval(() => {
        this.$store.commit("session/lockVote");
        if (this.session.lockedVote > this.players.length) {
          clearInterval(this.voteTimer);
        }
      }, this.session.votingSpeed * 1000);
    },
    stop() {
      clearInterval(this.voteTimer);
      this.$store.commit("session/lockVote", 0);
    },
    finish() {
      clearInterval(this.voteTimer);
      this.$store.commit("session/nomination");
    },
    vote(vote) {
      if (!this.canVote) return false;
      const index = this.players.findIndex(p => p.id === this.session.playerId);
      if (index >= 0 && !!this.session.votes[index] !== vote) {
        this.$store.commit("session/voteSync", [index, vote]);
      }
    },
    setVotingSpeed(diff) {
      const speed = this.session.votingSpeed + diff;
      if (speed > 0) {
        this.$store.commit("session/setVotingSpeed", speed);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../vars.scss";

#vote {
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

  svg {
    cursor: pointer;
    &:hover path {
      fill: url(#demon);
      stroke-width: 30px;
      stroke: white;
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
  width: 25%;
  pointer-events: none;
  span {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: transform 2.9s ease-in-out;
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

.button.vote-no {
  background: radial-gradient(
        at 0 -15%,
        rgba(255, 255, 255, 0.07) 70%,
        rgba(255, 255, 255, 0) 71%
      )
      0 0/80% 90% no-repeat content-box,
    linear-gradient(#0031ad, rgba(5, 0, 0, 0.22)) content-box,
    linear-gradient(#292929, #001142) border-box;
  box-shadow: inset 0 1px 1px #002c9c, 0 0 10px #000;
  &:hover {
    color: #008cf7;
  }
}
.button.vote-yes {
  background: radial-gradient(
        at 0 -15%,
        rgba(255, 255, 255, 0.07) 70%,
        rgba(255, 255, 255, 0) 71%
      )
      0 0/80% 90% no-repeat content-box,
    linear-gradient(#ad0000, rgba(5, 0, 0, 0.22)) content-box,
    linear-gradient(#292929, #420000) border-box;
  box-shadow: inset 0 1px 1px #9c0000, 0 0 10px #000;
}
</style>
