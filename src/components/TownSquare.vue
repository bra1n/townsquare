<template>
  <div
    id="townsquare"
    class="square"
    v-bind:class="{
      public: grimoire.isPublic,
      spectator: session.isSpectator,
      vote: session.nomination
    }"
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

    <div
      class="bluffs"
      v-if="players.length > 6"
      ref="bluffs"
      :class="{ closed: !isBluffsOpen }"
    >
      <h3>
        <font-awesome-icon icon="camera" @click.stop="takeScreenshot" />
        <span v-if="session.isSpectator">Other characters</span>
        <span v-else>Demon bluffs</span>
        <font-awesome-icon icon="times-circle" @click.stop="toggleBluffs" />
        <font-awesome-icon icon="plus-circle" @click.stop="toggleBluffs" />
      </h3>
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

    <div
      class="fabled"
      :class="{ closed: !isFabledOpen }"
      v-if="grimoire.fabled.length"
    >
      <h3>
        <span>Fabled</span>
        <font-awesome-icon icon="times-circle" @click.stop="toggleFabled" />
        <font-awesome-icon icon="plus-circle" @click.stop="toggleFabled" />
      </h3>
      <ul>
        <li
          v-for="(fabled, index) in grimoire.fabled"
          :key="index"
          @click="removeFabled(index)"
        >
          <Token :role="fabled"></Token>
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
      nominate: -1,
      isBluffsOpen: true,
      isFabledOpen: true
    };
  },
  methods: {
    takeScreenshot() {
      const { width, height, x, y } = this.$refs.bluffs.getBoundingClientRect();
      this.$emit("screenshot", { width, height, x, y });
    },
    toggleBluffs() {
      this.isBluffsOpen = !this.isBluffsOpen;
    },
    toggleFabled() {
      this.isFabledOpen = !this.isFabledOpen;
    },
    removeFabled(index) {
      this.$store.commit("setFabled", { index });
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
    nominatePlayer(from, to) {
      if (to === undefined) {
        this.cancel();
        if (from !== this.nominate) {
          this.nominate = from;
        }
      } else {
        const nomination = [this.nominate, this.players.indexOf(to)];
        this.$store.commit("session/nomination", { nomination });
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
#townsquare {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
}

.circle {
  padding: 0;
  width: 100%;
  height: 100%;
  list-style: none;
  margin: 0;

  > li {
    position: absolute;
    left: 50%;
    height: 50%;
    transform-origin: 0 100%;
    pointer-events: none;

    &:hover {
      z-index: 25 !important;
    }

    > .player {
      margin-left: -50%;
      width: 100%;
      pointer-events: all;
    }
    > .reminder {
      margin-left: -25%;
      width: 50%;
      pointer-events: all;
    }
  }
}

@mixin on-circle($item-count) {
  $angle: (360 / $item-count);
  $rot: 0;

  // rotation and tooltip placement
  @for $i from 1 through $item-count {
    &:nth-child(#{$i}) {
      transform: rotate($rot * 1deg);
      @if $i - 1 <= $item-count / 2 {
        // first half of players
        z-index: $item-count - $i + 1;
        // open menu on the left
        .player > .menu {
          left: auto;
          right: 100%;
          margin-right: 15px;
          &:before {
            border-left-color: black;
            border-right-color: transparent;
            right: auto;
            left: 100%;
          }
        }
        .fold-enter-active,
        .fold-leave-active {
          transform-origin: right center;
        }
        .fold-enter,
        .fold-leave-to {
          transform: perspective(200px) rotateY(-90deg);
        }
      } @else {
        // second half of players
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

      // animation cascade
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
          margin-bottom: -10% + 20% * (1 - ($x % $q / $q));
        }
      } @else {
        .player {
          margin-bottom: -10% + 20% * ($x % $q / $q);
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

/***** Demon bluffs / Fabled *******/
.bluffs,
.fabled {
  position: absolute;
  &.bluffs {
    bottom: 10px;
  }
  &.fabled {
    top: 10px;
  }
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 3px solid black;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
  transform-origin: bottom left;
  transform: scale(1);
  opacity: 1;
  transition: all 200ms ease-in-out;
  z-index: 50;

  #townsquare.public &.bluffs {
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
    margin: 5px 1vh 0;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    span {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    svg {
      cursor: pointer;
      flex-grow: 0;
      &.fa-camera {
        margin-right: 1vh;
      }
      &.fa-times-circle {
        margin-left: 1vh;
      }
      &.fa-plus-circle {
        margin-left: 1vh;
        display: none;
      }
      &:hover path {
        fill: url(#demon);
        stroke-width: 30px;
        stroke: white;
      }
    }
  }
  ul {
    display: flex;
    align-items: center;
    justify-content: center;
    li {
      width: 14vh;
      height: 14vh;
      margin: 0 0.5%;
      display: inline-block;
      transition: all 250ms;
    }
  }
  &.closed {
    svg.fa-camera {
      display: none;
    }
    svg.fa-times-circle {
      display: none;
    }
    svg.fa-plus-circle {
      display: block;
    }
    ul li {
      width: 0;
      height: 0;
      .token {
        border-width: 0;
      }
    }
  }
}

.fabled ul li .token:before {
  content: " ";
  opacity: 0;
  transition: opacity 250ms;
  background-image: url("../assets/icons/x.png");
  z-index: 2;
}

.fabled ul li:hover .token:before {
  opacity: 1;
}
</style>
