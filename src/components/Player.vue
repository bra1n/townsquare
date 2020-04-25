<template>
  <li>
    <div
      ref="player"
      class="player"
      :class="{
        dead: player.hasDied,
        'no-vote': player.hasVoted,
        traveler: player.role && player.role.team === 'traveler'
      }"
    >
      <div class="shroud" @click="toggleStatus()"></div>
      <div class="life" @click="toggleStatus()"></div>

      <div class="night first" v-if="player.firstNight">
        <em>{{ player.firstNight }}.</em>
        <span>{{ player.role.firstNightReminder | handleEmojis }}</span>
      </div>
      <div class="night other" v-if="player.otherNight">
        <em>{{ player.otherNight }}.</em>
        <span>{{ player.role.otherNightReminder | handleEmojis }}</span>
      </div>

      <Token :role="player.role" @set-role="setRole" />

      <div class="name" @click="changeName">
        <span class="screenshot" @click.stop="takeScreenshot">
          <font-awesome-icon icon="camera" />
        </span>
        <span class="name">
          {{ player.name }}
        </span>
        <span class="remove" @click.stop="$emit('remove-player', player)">
          <font-awesome-icon icon="times-circle" />
        </span>
      </div>
    </div>
    <template v-if="player.reminders">
      <div
        class="reminder"
        v-bind:key="reminder.role + ' ' + reminder.name"
        v-for="reminder in player.reminders"
        v-bind:class="[reminder.role]"
        @click="removeReminder(reminder)"
      >
        {{ reminder.name }}
      </div>
    </template>
    <div class="reminder add" @click="$emit('add-reminder', player)"></div>
  </li>
</template>

<script>
import Token from "./Token";

export default {
  components: {
    Token
  },
  props: {
    player: {
      type: Object,
      required: true
    },
    roles: {
      type: Map,
      required: true
    },
    isPublic: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {};
  },
  filters: {
    handleEmojis: text => text.replace(/:([^: ]+?):/g, "").replace(/ •/g, "\n•")
  },
  methods: {
    takeScreenshot() {
      const { width, height, x, y } = this.$refs.player.getBoundingClientRect();
      this.$emit("screenshot", { width, height, x, y });
    },
    toggleStatus() {
      if (this.isPublic) {
        if (!this.player.hasDied) {
          this.$set(this.player, "hasDied", true);
        } else if (this.player.hasVoted) {
          this.$set(this.player, "hasVoted", false);
          this.$set(this.player, "hasDied", false);
        } else {
          this.$set(this.player, "hasVoted", true);
        }
      } else {
        this.$set(this.player, "hasDied", !this.player.hasDied);
      }
    },
    setRole() {
      this.$emit("set-role", this.player);
    },
    changeName() {
      const name = prompt("Player name", this.player.name);
      this.player.name = name || this.player.name;
    },
    removeReminder(reminder) {
      this.player.reminders.splice(this.player.reminders.indexOf(reminder), 1);
    }
  }
};
</script>

<style lang="scss">
@import "../vars.scss";

/***** Player token *****/
.circle .player {
  margin-bottom: 10px;
  padding-top: $token + 6px;

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

    &:hover:before {
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

/***** Player name *****/
.player > .name {
  font-size: 120%;
  line-height: 120%;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 1))
    drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(0 0 1px rgba(0, 0, 0, 1));
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
  display: flex;
  justify-content: center;

  span.screenshot,
  span.remove {
    display: none;
    margin: 0 5px;
    flex-shrink: 0;
    flex-grow: 0;
    #app.screenshot & {
      display: none;
    }
  }
  span.name {
    flex-shrink: 1;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &:hover {
    color: red;
    span {
      display: block;
      color: white;
      &:hover {
        color: red;
      }
    }
  }
}

.player.dead > .name {
  opacity: 0.5;
}

/***** Ability text *****/
#townsquare.public .ability {
  display: none;
}
.circle .player:hover .ability {
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
  top: -16px;
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

  &:before,
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
