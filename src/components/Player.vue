<template>
  <li>
    <div
      ref="player"
      class="player"
      :class="{
        dead: player.isDead,
        'no-vote': player.isVoteless,
        traveler: player.role && player.role.team === 'traveler'
      }"
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

      <Token :role="player.role" @set-role="$emit('set-role')" />

      <font-awesome-icon
        icon="times-circle"
        class="cancel"
        title="Cancel"
        @click="doSwap(true)"
      />
      <font-awesome-icon
        icon="exchange-alt"
        class="swap"
        @click="doSwap()"
        title="Swap seats with this player"
      />

      <font-awesome-icon
        icon="vote-yea"
        class="vote"
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
        <ul class="menu" v-if="isMenuOpen && !session.isSpectator">
          <li @click="changeName">
            <font-awesome-icon icon="user-edit" />
            Rename
          </li>
          <!--<li @click="nomination">
            <font-awesome-icon icon="hand-point-right" />
            Nomination
          </li>-->
          <li @click="initSwap">
            <font-awesome-icon icon="exchange-alt" />
            Swap seats
          </li>
          <li @click="takeScreenshot">
            <font-awesome-icon icon="camera" />
            Screenshot
          </li>
          <li @click="$emit('remove-player')">
            <font-awesome-icon icon="times-circle" />
            Remove
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
        {{ reminder.name }}
      </div>
    </template>
    <div class="reminder add" @click="$emit('add-reminder')">
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
    ...mapState(["grimoire", "session"]),
    ...mapGetters({ nightOrder: "players/nightOrder" })
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
    },
    updatePlayer(property, value) {
      if (this.session.isSpectator && property !== "reminders") return;
      this.$store.commit("players/update", {
        player: this.player,
        property,
        value
      });
    },
    initSwap() {
      this.isMenuOpen = false;
      this.$emit("swap-seats");
    },
    doSwap(cancel) {
      this.$emit("swap-seats", cancel ? false : this.player);
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
  padding-top: $token + 6px;
  padding-bottom: 5px;

  .shroud {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 2/3 * $token;
    cursor: pointer;
    transform: rotateX(0deg);
    transform-origin: top center;
    transition: transform 200ms ease-in-out;
    z-index: 2;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.8));

    &:before {
      content: " ";
      background: url("../assets/shroud.png") center -10px no-repeat;
      background-size: auto 100%;
      position: absolute;
      margin-left: -2/6 * $token;
      width: 2/3 * $token;
      height: 2/3 * $token;
      left: 50%;
      top: -30px;
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
    height: $token + 6px;
    width: $token + 6px;
    background: url("../assets/life.png") center center;
    background-size: 100%;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 200ms ease-in-out;
    transform: perspective(400px) rotateY(180deg);
    backface-visibility: hidden;
    position: absolute;
    left: 50%;
    top: 0;
    margin-left: ($token + 6) / -2;
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
        height: $token + 3px;
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
  height: $token + 6px;
  width: $token + 6px;
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
  &.cancel {
    top: 9%;
    left: 20%;
    width: 60%;
    height: 60%;
    opacity: 0;
    pointer-events: none;
    transition: all 250ms;
    transform: scale(0.2);
    &:hover {
      color: red;
    }
  }
}

li.swap-from .player > svg.cancel {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}

li.swap:not(.swap-from) .player > svg.swap {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}

/****** Vote icon ********/
.player .vote {
  position: absolute;
  right: 2px;
  bottom: 45px;
  color: #fff;
  filter: drop-shadow(0 0 3px black);
  cursor: pointer;
  transition: opacity 250ms;

  #townsquare.public & {
    opacity: 0;
    pointer-events: none;
  }
}

/***** Player name *****/
.player > .name {
  font-size: 120%;
  line-height: 120%;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid black;
  border-radius: 10px;
  top: 5px;
  box-shadow: 0 0 5px black;
  text-overflow: ellipsis;
  overflow: hidden;

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
  padding: 0 5px;
  border-radius: 5px;
  border: 3px solid black;
  margin-left: 15px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

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
  width: $token / 2;
  height: $token / 2;
  color: black;
  font-size: 45%;
  font-weight: bold;
  display: block;
  margin: 5px ($token / -4) 0;
  text-align: center;
  padding: ($token * 0.3 + 2px) 5px 0;
  border-radius: 50%;
  line-height: 90%;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: all 200ms;
  cursor: pointer;

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
