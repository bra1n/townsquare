<template>
  <ul class="info">
    <li class="edition" v-bind:class="['edition-' + edition]"></li>
    <li v-if="players.length < 5">Please add more players!</li>
    <li>
      {{ players.length }} <font-awesome-icon class="players" icon="users" />
      {{ teams.alive }} <font-awesome-icon class="alive" icon="heartbeat" />
      {{ teams.votes }} <font-awesome-icon class="votes" icon="vote-yea" />
    </li>
    <li v-if="players.length >= 5">
      {{ teams.townsfolk }}
      <font-awesome-icon class="townsfolk" icon="user-friends" />
      {{ teams.outsiders }}
      <font-awesome-icon
        class="outsider"
        v-bind:icon="teams.outsiders > 1 ? 'user-friends' : 'user'"
      />
      {{ teams.minions }}
      <font-awesome-icon
        class="minion"
        v-bind:icon="teams.minions > 1 ? 'user-friends' : 'user'"
      />
      {{ teams.demons }}
      <font-awesome-icon
        class="demon"
        v-bind:icon="teams.demons > 1 ? 'user-friends' : 'user'"
      />
      <template v-if="teams.travellers">
        {{ teams.travellers }}
        <font-awesome-icon
          class="traveller"
          v-bind:icon="teams.travellers > 1 ? 'user-friends' : 'user'"
        />
      </template>
    </li>
  </ul>
</template>

<script>
import gameJSON from "./../game";

export default {
  props: {
    players: {
      type: Array,
      required: true
    },
    edition: {
      type: String,
      required: true
    }
  },
  computed: {
    teams: function() {
      const nontravellers = this.players.filter(
        player => player.role.team !== "traveller"
      ).length;
      const alive = this.players.filter(player => player.hasDied !== true)
        .length;
      return {
        ...gameJSON[nontravellers - 5],
        travellers: this.players.length - nontravellers,
        alive,
        votes:
          alive +
          this.players.filter(
            player => player.hasDied === true && player.hasVoted !== true
          ).length
      };
    }
  }
};
</script>

<style lang="scss">
@import "../vars.scss";

.info {
  position: absolute;
  display: flex;
  left: 50%;
  top: 50%;
  width: 20%;
  height: 20%;
  margin-left: -10%;
  margin-top: -5%;
  padding: 50px 0 0;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  background: url("../assets/demon-head.png") center center no-repeat;
  background-size: auto 100%;

  li {
    display: block;
    white-space: nowrap;
    font-weight: bold;
    text-align: center;
    padding: 0 5px;
    width: 100%;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.7));

    svg {
      margin-right: 10px;
    }

    .players {
      color: #00f700;
    }
    .alive {
      color: #ff4a50;
    }
    .votes {
      color: #1cfff2;
    }
    .townsfolk {
      color: $townsfolk;
    }
    .outsider {
      color: $outsider;
    }
    .minion {
      color: $minion;
    }
    .demon {
      color: $demon;
    }
    .traveller {
      color: $traveller;
    }
  }

  li.edition {
    width: 220px;
    height: 200px;
    background: 0 center no-repeat;
    background-size: 100% auto;
    position: absolute;
    top: -50px;

    &.edition-TB {
      background-image: url("../assets/edition-tb.png");
    }
    &.edition-BMR {
      background-image: url("../assets/edition-bmr.png");
    }
    &.edition-SNV {
      background-image: url("../assets/edition-snv.png");
    }
  }
}
</style>
