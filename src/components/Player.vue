<template>
  <li>
    <div
      ref="player"
      class="player"
      :class="[
        {
          dead: player.isDead,
          'no-vote': player.isVoteless,
          you: player.id === session.playerId,
          'vote-yes': session.votes[index],
          'vote-lock': voteLocked
        },
        player.role.team
      ]"
    >
      <div class="shroud" @click="toggleStatus()"></div>
      <div class="life" @click="toggleStatus()"></div>

      <div
        class="night first"
        v-if="nightOrder.get(player).first && grimoire.isNightOrder"
      >
        <em>{{ nightOrder.get(player).first }}.</em>
        <span v-if="player.role.firstNightReminder">{{
          player.role.firstNightReminder | handleEmojis
        }}</span>
      </div>
      <div
        class="night other"
        v-if="nightOrder.get(player).other && grimoire.isNightOrder"
      >
        <em>{{ nightOrder.get(player).other }}.</em>
        <span v-if="player.role.otherNightReminder">{{
          player.role.otherNightReminder | handleEmojis
        }}</span>
      </div>

      <Token
        :role="player.role"
        @set-role="$emit('trigger', ['openRoleModal'])"
      />

      <!-- Overlay icons -->
      <font-awesome-icon
        icon="skull"
        class="vote"
        title="Voted YES"
        @click="vote()"
      />
      <font-awesome-icon
        icon="times"
        class="vote"
        title="Voted NO"
        @click="vote()"
      />
      <font-awesome-icon
        icon="times-circle"
        class="cancel"
        title="Cancel"
        @click="cancel()"
      />
      <font-awesome-icon
        icon="exchange-alt"
        class="swap"
        @click="swapPlayer(player)"
        title="Swap seats with this player"
      />
      <font-awesome-icon
        icon="redo-alt"
        class="move"
        @click="movePlayer(player)"
        title="Move player to this seat"
      />
      <font-awesome-icon
        icon="hand-point-right"
        class="nominate"
        @click="nominatePlayer(player)"
        title="Nominate this player"
      />

      <!-- Claimed seat icon -->
      <font-awesome-icon icon="chair" v-if="player.id" class="seat" />

      <!-- Ghost vote icon -->
      <font-awesome-icon
        icon="vote-yea"
        class="has-vote"
        v-if="player.isDead && !player.isVoteless"
        @click="updatePlayer('isVoteless', true)"
        title="Ghost vote"
      />

      <div
        class="name"
        @click="isMenuOpen = !isMenuOpen"
        v-bind:class="{ active: isMenuOpen }"
      >
        {{ player.name }}
      </div>

      <transition name="fold">
        <ul class="menu" v-if="isMenuOpen">
          <template v-if="!session.isSpectator">
            <li @click="changeName">
              <font-awesome-icon icon="user-edit" />Rename
            </li>
            <li v-if="!session.nomination" @click="nominatePlayer()">
              <font-awesome-icon icon="hand-point-right" />
              Nomination
            </li>
            <li @click="movePlayer()">
              <font-awesome-icon icon="redo-alt" />
              Move player
            </li>
            <li @click="swapPlayer()">
              <font-awesome-icon icon="exchange-alt" />
              Swap seats
            </li>
            <li @click="takeScreenshot">
              <font-awesome-icon icon="camera" />
              Screenshot
            </li>
            <li @click="$emit('trigger', ['removePlayer'])">
              <font-awesome-icon icon="times-circle" />
              Remove
            </li>
          </template>
          <li @click="claimSeat" v-if="session.isSpectator">
            <font-awesome-icon icon="chair" />
            <template v-if="player.id !== session.playerId">
              Claim seat
            </template>
            <template v-else> Vacate seat </template>
          </li>
        </ul>
      </transition>
    </div>

    <template v-if="player.reminders">
      <div
        class="reminder"
        v-bind:key="reminder.role + ' ' + reminder.name"
        v-for="reminder in player.reminders"
        v-bind:class="[reminder.role]"
        @click="removeReminder(reminder)"
      >
        <span
          class="icon"
          v-bind:style="{
            backgroundImage: `url(${require('../assets/icons/' +
              reminder.role +
              '.png')})`
          }"
        ></span>
        <span class="text">{{ reminder.name }}</span>
      </div>
    </template>
    <div class="reminder add" @click="$emit('trigger', ['openReminderModal'])">
      <span class="icon"></span>
    </div>
  </li>
</template>

<script>
import Token from "./Token";
import { mapGetters, mapState } from "vuex";

export default {
  components: {
    Token
  },
  props: {
    player: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState("players", ["players"]),
    ...mapState(["grimoire", "session"]),
    ...mapGetters({ nightOrder: "players/nightOrder" }),
    index: function() {
      return this.players.indexOf(this.player);
    },
    voteLocked: function() {
      const session = this.session;
      const players = this.players.length;
      if (!session.nomination) return false;
      const indexAdjusted =
        (this.index - 1 + players - session.nomination[1]) % players;
      return indexAdjusted < session.lockedVote - 1;
    }
  },
  data() {
    return {
      isMenuOpen: false,
      isSwap: false
    };
  },
  filters: {
    handleEmojis: text => text.replace(/:([^: ]+?):/g, "").replace(/ •/g, "\n•")
  },
  methods: {
    takeScreenshot() {
      const { width, height, x, y } = this.$refs.player.getBoundingClientRect();
      this.$emit("screenshot", { width, height, x, y });
      this.isMenuOpen = false;
    },
    toggleStatus() {
      if (this.grimoire.isPublic) {
        if (!this.player.isDead) {
          this.updatePlayer("isDead", true);
        } else if (this.player.isVoteless) {
          this.updatePlayer("isVoteless", false);
          this.updatePlayer("isDead", false);
        } else {
          this.updatePlayer("isVoteless", true);
        }
      } else {
        this.updatePlayer("isDead", !this.player.isDead);
        if (this.player.isVoteless) {
          this.updatePlayer("isVoteless", false);
        }
      }
    },
    changeName() {
      if (this.session.isSpectator) return;
      const name = prompt("Player name", this.player.name) || this.player.name;
      this.updatePlayer("name", name);
      this.isMenuOpen = false;
    },
    removeReminder(reminder) {
      const reminders = [...this.player.reminders];
      reminders.splice(this.player.reminders.indexOf(reminder), 1);
      this.updatePlayer("reminders", reminders);
      this.isMenuOpen = false;
    },
    updatePlayer(property, value) {
      if (this.session.isSpectator && property !== "reminders") return;
      this.$store.commit("players/update", {
        player: this.player,
        property,
        value
      });
    },
    swapPlayer(player) {
      this.isMenuOpen = false;
      this.$emit("trigger", ["swapPlayer", player]);
    },
    movePlayer(player) {
      this.isMenuOpen = false;
      this.$emit("trigger", ["movePlayer", player]);
    },
    nominatePlayer(player) {
      this.isMenuOpen = false;
      this.$emit("trigger", ["nominatePlayer", player]);
    },
    cancel() {
      this.$emit("trigger", ["cancel"]);
    },
    claimSeat() {
      this.isMenuOpen = false;
      this.$emit("trigger", ["claimSeat"]);
    },
    vote() {
      if (this.player.id !== this.session.playerId) return;
      this.$store.commit("session/vote", [this.index]);
    }
  }
};
</script>

<style lang="scss">
@import "../vars.scss";

.fold-enter-active,
.fold-leave-active {
  transition: transform 250ms ease-in-out;
  transform-origin: left center;
  transform: perspective(200px);
}
.fold-enter,
.fold-leave-to {
  transform: perspective(200px) rotateY(90deg);
}

/***** Player token *****/
.circle .player {
  margin-bottom: 10px;
  padding-bottom: 5px;

  &:before {
    content: " ";
    display: block;
    padding-top: 100%;
  }

  .shroud {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 45%;
    cursor: pointer;
    transform: rotateX(0deg);
    transform-origin: top center;
    transition: transform 200ms ease-in-out;
    z-index: 2;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.8));

    &:before {
      content: " ";
      background: url("../assets/shroud.png") center -10px no-repeat;
      background-size: auto 110%;
      position: absolute;
      margin-left: -50%;
      width: 100%;
      height: 100%;
      left: 50%;
      top: -30%;
      opacity: 0;
      transform: perspective(400px) scale(1.5);
      transform-origin: top center;
      transition: all 200ms ease-in-out;
      pointer-events: none;
    }

    #townsquare.spectator & {
      pointer-events: none;
    }

    #townsquare:not(.spectator) &:hover:before {
      opacity: 0.5;
      top: -10px;
      transform: scale(1);
    }
  }

  &.dead .shroud:before {
    opacity: 1;
    top: 0;
    transform: perspective(400px) scale(1);
  }
}

/****** Life token *******/
.player {
  z-index: 2;
  .life {
    border-radius: 50%;
    width: 100%;
    background: url("../assets/life.png") center center;
    background-size: 100%;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 200ms ease-in-out;
    transform: perspective(400px) rotateY(180deg);
    backface-visibility: hidden;
    position: absolute;
    left: 0;
    top: 0;

    &:before {
      content: " ";
      display: block;
      padding-top: 100%;
    }
  }

  &.dead {
    &.no-vote .life:after {
      display: none;
    }

    .life {
      background-image: url("../assets/death.png");

      &:after {
        content: " ";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: url("../assets/vote.png") center center no-repeat;
        background-size: 50%;
        height: 100%;
        pointer-events: none;
      }
    }
  }

  &.traveler .life {
    filter: grayscale(100%);
  }
}

#townsquare.public .player {
  .shroud {
    transform: perspective(400px) rotateX(90deg);
    pointer-events: none;
  }

  .life {
    transform: perspective(400px) rotateY(0deg);
  }

  &.traveler:not(.dead) .token {
    transform: perspective(400px) scale(0.8);
    pointer-events: none;
    transition-delay: 0s;
  }

  &.traveler.dead .token {
    transition-delay: 0s;
  }
}

/***** Role token ******/
.player .token {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  transition: transform 200ms ease-in-out;
  transform: perspective(400px) rotateY(0deg);
  backface-visibility: hidden;
}

#townsquare.public .circle .token {
  transform: perspective(400px) rotateY(-180deg);
}

/****** Player choice icons *******/
.player > svg {
  position: absolute;
  filter: drop-shadow(0 0 3px black);
  z-index: 2;
  cursor: pointer;
  &.swap,
  &.move,
  &.nominate,
  &.vote,
  &.cancel {
    top: 9%;
    left: 25%;
    width: 50%;
    height: 60%;
    opacity: 0;
    pointer-events: none;
    transition: all 250ms;
    transform: scale(0.2);
    * {
      stroke-width: 10px;
      stroke: white;
      fill: url(#default);
    }
    &:hover *,
    &.fa-skull * {
      fill: url(#demon);
    }
    &.fa-times * {
      fill: url(#townsfolk);
    }
  }
}

#townsquare.vote .player.vote-yes > svg.vote.fa-skull {
  opacity: 0.5;
  transform: scale(1);
}

#townsquare.vote .player.you.vote-yes > svg.vote.fa-skull,
#townsquare.vote .player.vote-lock.vote-yes > svg.vote.fa-skull,
#townsquare.vote .player.vote-lock:not(.vote-yes) > svg.vote.fa-times {
  opacity: 1;
  transform: scale(1);
}

li.from:not(.nominate) .player > svg.cancel {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}

li.swap:not(.from) .player > svg.swap,
li.nominate .player > svg.nominate,
li.move:not(.from) .player > svg.move {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}

/****** Vote icon ********/
.player .has-vote {
  position: absolute;
  right: 2px;
  bottom: 45px;
  color: #fff;
  filter: drop-shadow(0 0 3px black);
  transition: opacity 250ms;

  #townsquare.public & {
    opacity: 0;
    pointer-events: none;
  }
}

@mixin glow($name, $color) {
  @keyframes #{$name}-glow {
    0% {
      box-shadow: 0 0 rgba($color, 1);
      border-color: $color;
    }
    50% {
      border-color: black;
    }
    100% {
      box-shadow: 0 0 20px 16px transparent;
      border-color: $color;
    }
  }

  .player.you.#{$name} .token {
    animation: #{$name}-glow 2s ease-in-out infinite;
  }
}

@include glow("townsfolk", $townsfolk);
@include glow("outsider", $outsider);
@include glow("demon", $demon);
@include glow("minion", $minion);
@include glow("traveler", $traveler);

.player.you .token {
  animation: townsfolk-glow 2s ease-in-out infinite;
}

/****** Seat icon ********/
.player .seat {
  position: absolute;
  left: 2px;
  bottom: 45px;
  color: #fff;
  filter: drop-shadow(0 0 3px black);
  cursor: default;
}

.player.you .seat {
  color: $townsfolk;
}

/***** Player name *****/
.player > .name {
  font-size: 120%;
  line-height: 120%;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid black;
  border-radius: 10px;
  top: 5px;
  box-shadow: 0 0 5px black;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 4px;

  #townsquare:not(.spectator) &:hover,
  &.active {
    color: red;
  }
}

.player.dead > .name {
  opacity: 0.5;
}

/***** Player menu *****/
.player > .menu {
  position: absolute;
  left: 100%;
  bottom: 0;
  text-align: left;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 5px;
  border-radius: 10px;
  border: 3px solid #000;
  margin-left: 15px;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

  &:before {
    content: " ";
    width: 0;
    height: 0;
    position: absolute;
    border: 10px solid transparent;
    border-right-color: black;
    right: 100%;
    bottom: 7px;
    margin-right: 2px;
  }

  li:hover {
    color: red;
  }
  svg {
    margin-right: 2px;
  }
}

/***** Ability text *****/
#townsquare.public .ability {
  display: none;
}
.circle .player .shroud:hover ~ .token .ability,
.circle .player .token:hover .ability {
  opacity: 1;
}

/**** Night reminders ****/
.player .night {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
  cursor: pointer;
  opacity: 1;
  transition: opacity 200ms;
  display: flex;
  top: -20px;
  align-items: center;
  pointer-events: none;

  #townsquare.public & {
    opacity: 0;
    pointer-events: none;
  }

  &:hover ~ .token .ability {
    opacity: 0;
  }

  span {
    display: flex;
    position: absolute;
    padding: 5px 10px 5px 30px;
    width: 350px;
    z-index: 25;
    font-size: 70%;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    border: 3px solid black;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
    text-align: left;
    align-items: center;
    opacity: 0;
    transition: opacity 200ms ease-in-out;

    &:before {
      transform: rotate(-90deg);
      transform-origin: center top;
      left: -98px;
      top: 50%;
      font-size: 100%;
      position: absolute;
      font-weight: bold;
      text-align: center;
      width: 200px;
    }

    &:after {
      content: " ";
      border: 10px solid transparent;
      width: 0;
      height: 0;
      position: absolute;
    }
  }

  &.first span {
    right: 120%;
    background: linear-gradient(
      to right,
      $townsfolk 0%,
      rgba(0, 0, 0, 0.5) 20%
    );
    &:before {
      content: "First Night";
    }
    &:after {
      border-left-color: $townsfolk;
      margin-left: 3px;
      left: 100%;
    }
  }

  &.other span {
    left: 120%;
    background: linear-gradient(to right, $demon 0%, rgba(0, 0, 0, 0.5) 20%);
    &:before {
      content: "Other Nights";
    }
    &:after {
      right: 100%;
      margin-right: 3px;
      border-right-color: $demon;
    }
  }

  em {
    font-style: normal;
    position: absolute;
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 37px;
    border-radius: 50%;
    border: 3px solid black;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));
    font-weight: bold;
    opacity: 1;
    pointer-events: all;
    transition: opacity 200ms;
  }

  &.first em {
    left: -15px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, $townsfolk 100%);
  }

  &.other em {
    right: -15px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, $demon 100%);
  }

  em:hover + span {
    opacity: 1;
  }

  #app.screenshot & {
    display: none;
  }
}

.player.dead .night em {
  opacity: 0;
}

/***** Reminder token *****/
.circle .reminder {
  background: url("../assets/reminder.png") center center;
  background-size: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0 0 -25%;
  border-radius: 50%;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 200ms;
  cursor: pointer;
  &:before {
    content: " ";
    display: block;
    padding-top: 100%;
  }

  .text {
    line-height: 90%;
    color: black;
    font-size: 45%;
    font-weight: bold;
    position: absolute;
    width: 90%;
    text-align: center;
    margin-top: 25%;
  }

  .icon,
  &:after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: 100%;
    background-position: center 0;
    background-repeat: no-repeat;
    background-image: url("../assets/icons/plus.png");
    transition: opacity 200ms;
  }

  &:after {
    background-image: url("../assets/icons/x.png");
    opacity: 0;
  }

  &.add {
    opacity: 0;
    top: 30px;
    &:after {
      display: none;
    }
  }

  &.custom {
    .icon {
      display: none;
    }
    .text {
      font-size: 70%;
      word-break: break-word;
      margin-top: 0;
    }
  }

  &:hover:before {
    opacity: 0;
  }
  &:hover:after {
    opacity: 1;
  }
}
.circle li:hover .reminder.add {
  opacity: 1;
  top: 0;
}
.circle li:hover .reminder.add:before {
  opacity: 1;
}

#townsquare.public .reminder {
  opacity: 0;
  pointer-events: none;
}
</style>
