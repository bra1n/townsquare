<template>
  <div
    id="townsquare"
    class="square"
    v-bind:class="{
      public: grimoire.isPublic,
      spectator: session.isSpectator
    }"
    v-bind:style="{ zoom: grimoire.zoom }"
  >
    <ul class="circle" v-bind:class="['size-' + players.length]">
      <Player
        v-for="(player, index) in players"
        :key="index"
        :player="player"
        @screenshot="$emit('screenshot', $event)"
        @trigger="handleTrigger(index, $event)"
        v-bind:class="{
          from: Math.max(swap, move, nominate) === index,
          swap: swap > -1,
          move: move > -1,
          nominate: nominate > -1
        }"
      ></Player>
    </ul>

    <div class="bluffs" v-if="players.length > 6" ref="bluffs">
      <h3>Demon bluffs</h3>
      <font-awesome-icon icon="camera" @click.stop="takeScreenshot" />
      <ul>
        <li
          v-for="index in bluffs"
          :key="index"
          @click="openRoleModal(index * -1)"
        >
          <Token :role="grimoire.bluffs[index - 1]"></Token>
        </li>
      </ul>
    </div>

    <ReminderModal :player-index="selectedPlayer"></ReminderModal>
    <RoleModal :player-index="selectedPlayer"></RoleModal>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Player from "./Player";
import Token from "./Token";
import ReminderModal from "./modals/ReminderModal";
import RoleModal from "./modals/RoleModal";

export default {
  components: {
    Player,
    Token,
    RoleModal,
    ReminderModal
  },
  computed: {
    ...mapState(["grimoire", "roles", "session"]),
    ...mapState("players", ["players"])
  },
  data() {
    return {
      selectedPlayer: 0,
      bluffs: 3,
      swap: -1,
      move: -1,
      nominate: -1
    };
  },
  methods: {
    takeScreenshot() {
      const { width, height, x, y } = this.$refs.bluffs.getBoundingClientRect();
      this.$emit("screenshot", { width, height, x, y });
    },
    handleTrigger(playerIndex, [method, params]) {
      if (typeof this[method] === "function") {
        this[method](playerIndex, params);
      }
    },
    claimSeat(playerIndex) {
      if (!this.session.isSpectator) return;
      if (this.session.playerId === this.players[playerIndex].id) {
        this.$store.commit("session/claimSeat", -1);
      } else {
        this.$store.commit("session/claimSeat", playerIndex);
      }
    },
    openReminderModal(playerIndex) {
      this.selectedPlayer = playerIndex;
      this.$store.commit("toggleModal", "reminder");
    },
    openRoleModal(playerIndex) {
      const player = this.players[playerIndex];
      if (this.session.isSpectator && player && player.role.team === "traveler")
        return;
      this.selectedPlayer = playerIndex;
      this.$store.commit("toggleModal", "role");
    },
    removePlayer(playerIndex) {
      if (this.session.isSpectator) return;
      if (
        confirm(
          `Do you really want to remove ${this.players[playerIndex].name}?`
        )
      ) {
        this.$store.commit("players/remove", playerIndex);
      }
    },
    swapPlayer(from, to) {
      if (to === undefined) {
        this.cancel();
        this.swap = from;
      } else {
        this.$store.commit("players/swap", [
          this.swap,
          this.players.indexOf(to)
        ]);
        this.cancel();
      }
    },
    movePlayer(from, to) {
      if (to === undefined) {
        this.cancel();
        this.move = from;
      } else {
        this.$store.commit("players/move", [
          this.move,
          this.players.indexOf(to)
        ]);
        this.cancel();
      }
    },
    cancel() {
      this.move = -1;
      this.swap = -1;
      this.nominate = -1;
    }
  }
};
</script>

<style lang="scss">
.circle {
  padding: 0;
  width: 100%;
  height: 100%;
  list-style: none;
  margin: 0;

  > li {
    position: absolute;
    top: 0;
    left: 50%;
    height: 50%;
    transform-origin: 0 100%;
    text-align: center;

    &:hover {
      z-index: 25 !important;
    }

    > * {
      margin-left: -78px;
      width: 156px;
    }
  }
}

@mixin on-circle($item-count) {
  $angle: (360 / $item-count);
  $rot: 0;

  @for $i from 1 through $item-count {
    &:nth-child(#{$i}) {
      transform: rotate($rot * 1deg);
      @if $i - 1 <= $item-count / 2 {
        z-index: $item-count - $i + 1;
      } @else {
        z-index: $i - 1;
        .ability {
          right: 120%;
          left: auto;
          &:before {
            border-right-color: transparent;
            border-left-color: black;
            right: auto;
            left: 100%;
          }
        }
      }
      > * {
        transform: rotate($rot * -1deg);
      }
      .life,
      .token,
      .shroud,
      .night {
        transition-delay: ($i - 1) * 50ms;
      }

      // move reminders closer to the sides of the circle
      $q: $item-count / 4;
      $x: $i - 1;
      @if $x < $q or ($x >= $item-count / 2 and $x < $q * 3) {
        .player {
          margin-bottom: -10px + 20px * (1 - ($x % $q / $q));
        }
      } @else {
        .player {
          margin-bottom: -10px + 20px * ($x % $q / $q);
        }
      }
    }
    $rot: $rot + $angle;
  }
}

@for $i from 1 through 20 {
  .circle.size-#{$i} > li {
    @include on-circle($item-count: $i);
  }
}

#townsquare {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 20px;
}

/***** Demon bluffs *******/
.bluffs {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 3px solid black;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
  transform-origin: bottom left;
  transform: scale(1);
  opacity: 1;
  transition: all 200ms ease-in-out;

  #townsquare.public & {
    opacity: 0;
    transform: scale(0.1);
  }
  > svg {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    &:hover {
      color: red;
    }
    #app.screenshot & {
      display: none;
    }
  }
  h3 {
    margin-top: 5px;
  }
  li {
    width: 120px;
    height: 120px;
    margin: 0 5px;
    display: inline-block;
    font-size: 18px;
  }
}
</style>
