<template>
  <li>
    <div
      class="player"
      :class="{
        dead: player.hasDied,
        'no-vote': player.hasVoted,
        traveler: player.role && player.role.team === 'traveler'
      }"
    >
      <div class="shroud" @click="toggleStatus()"></div>
      <div class="life" @click="toggleStatus()"></div>
      <Token :role="player.role" @set-role="setRole" />

      <div class="name" @click="changeName">
        {{ player.name }}
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
  methods: {
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
  &.dead > .name {
    opacity: 0.5;
  }
}

/****** Life token *******/
.player {
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
  left: 50%;
  top: 0;
  margin-left: ($token + 6) / -2;
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
  span {
    display: none;
  }
  &:hover span {
    display: inline-block;
    &:hover {
      color: red;
    }
  }
}

/***** Ability text *****/
#townsquare.public .ability {
  display: none;
}
.circle .player:hover .ability {
  opacity: 1;
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
