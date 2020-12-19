<template>
  <ul class="info">
    <li
      class="edition"
      :class="['edition-' + edition]"
      :style="{
        backgroundImage: `url(${edition.logo ||
          require('../assets/editions/' + edition.id + '.png')})`
      }"
    ></li>
    <li v-if="players.length - teams.traveler < 5">
      Please add more players!
    </li>
    <li>
      {{ players.length }} <font-awesome-icon class="players" icon="users" />
      {{ teams.alive }} <font-awesome-icon class="alive" icon="heartbeat" />
      {{ teams.votes }} <font-awesome-icon class="votes" icon="vote-yea" />
    </li>
    <li v-if="players.length - teams.traveler >= 5">
      {{ teams.townsfolk }}
      <font-awesome-icon class="townsfolk" icon="user-friends" />
      {{ teams.outsider }}
      <font-awesome-icon
        class="outsider"
        :icon="teams.outsider > 1 ? 'user-friends' : 'user'"
      />
      {{ teams.minion }}
      <font-awesome-icon
        class="minion"
        :icon="teams.minion > 1 ? 'user-friends' : 'user'"
      />
      {{ teams.demon }}
      <font-awesome-icon
        class="demon"
        :icon="teams.demon > 1 ? 'user-friends' : 'user'"
      />
      <template v-if="teams.traveler">
        {{ teams.traveler }}
        <font-awesome-icon
          class="traveler"
          :icon="teams.traveler > 1 ? 'user-friends' : 'user'"
        />
      </template>
      <template v-if="grimoire.isNight">
        <br />
        Night phase
        <font-awesome-icon :icon="['fas', 'cloud-moon']" />
      </template>
    </li>
  </ul>
</template>

<script>
import gameJSON from "./../game";
import { mapState } from "vuex";

export default {
  computed: {
    teams: function() {
      const { players } = this.$store.state.players;
      const nonTravelers = this.$store.getters["players/nonTravelers"];
      const alive = players.filter(player => player.isDead !== true).length;
      return {
        ...gameJSON[nonTravelers - 5],
        traveler: players.length - nonTravelers,
        alive,
        votes:
          alive +
          players.filter(
            player => player.isDead === true && player.isVoteless !== true
          ).length
      };
    },
    ...mapState(["edition", "grimoire"]),
    ...mapState("players", ["players"])
  }
};
</script>

<style lang="scss" scoped>
@import "../vars.scss";

.info {
  position: absolute;
  display: flex;
  width: 20%;
  height: 20%;
  padding: 50px 0 0;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  background: url("../assets/demon-head.png") center center no-repeat;
  background-size: auto 100%;

  li {
    display: block;
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
      color: #fff;
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
    .traveler {
      color: $traveler;
    }
  }

  li.edition {
    width: 220px;
    height: 200px;
    max-width: 100%;
    max-height: 100%;
    background-position: 0 center;
    background-repeat: no-repeat;
    background-size: 100% auto;
    position: absolute;
    top: -25%;
  }
}
</style>
