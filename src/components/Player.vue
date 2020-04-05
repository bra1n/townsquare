<template>
  <li>
    <div
      class="player"
      :class="{
        dead: player.hasDied,
        'no-vote': player.hasVoted,
        traveller: player.role.team === 'traveller'
      }"
    >
      <div class="shroud" @click="toggleStatus()"></div>
      <div class="token" @click="changeRole()" :class="[player.role.id]">
        <span class="leaf-left" v-if="player.role.firstNight"></span>
        <span class="leaf-right" v-if="player.role.otherNight"></span>
        <span
          v-if="player.role.reminders && player.role.reminders.length"
          v-bind:class="['leaf-top' + player.role.reminders.length]"
        ></span>
        <span class="leaf-orange" v-if="player.role.setup"></span>
        <div>{{ player.role.name }}</div>
      </div>
      <div class="ability" v-if="player.role.ability">
        {{ player.role.ability }}
      </div>
      <div class="name" @click="changeName">{{ player.name }}</div>
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
export default {
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
      if (!this.isPublic || !this.player.hasDied) {
        this.$set(this.player, "hasDied", !this.player.hasDied);
        if (!this.player.hasDied) {
          this.$set(this.player, "hasVoted", false);
        }
      } else {
        this.$set(this.player, "hasVoted", !this.player.hasVoted);
      }
    },
    changeRole() {
      if (!this.isPublic) {
        this.$emit("set-role", this.player);
      } else {
        this.toggleStatus();
      }
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

  .shroud {
    content: " ";
    background: url("../assets/shroud.png") center -10px no-repeat;
    background-size: auto 100%;
    position: absolute;
    margin-left: -2/6 * $token;
    width: 2/3 * $token;
    height: 2/3 * $token;
    left: 50%;
    top: -30px;
    cursor: pointer;
    opacity: 0;
    transform: scale(1.5);
    transition: all 200ms;
    z-index: 2;
    &:hover {
      opacity: 0.5;
      top: -10px;
      transform: scale(1);
    }
  }

  &.dead .shroud {
    opacity: 1;
    top: 0;
    transform: scale(1);
  }
  &.dead .name {
    opacity: 0.5;
  }
}

#townsquare.public .player.dead {
  &:after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    background: url("../assets/vote.png") center center no-repeat;
    background-size: 40%;
    height: $token + 3px;
    pointer-events: none;
  }
  &.traveller:after {
    filter: grayscale(100%);
  }
  &.no-vote:after {
    display: none;
  }
}

#townsquare.public .player .shroud {
  display: none;
}

/***** Role token ******/
.circle .token {
  border-radius: 50%;
  height: $token + 3px;
  width: $token + 3px;
  background: url("../assets/token.png") center center;
  background-size: 100%;
  text-align: center;
  color: black;
  margin: auto;
  font-weight: 600;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
    1px 1px 0 #fff, 0 0 5px rgba(0, 0, 0, 0.75);
  padding-top: $token * 0.7;
  font-family: "Papyrus", serif;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;

  &:before {
    content: " ";
    background-size: 100%;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  span {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 100%;
    left: 0;
    top: 0;
    pointer-events: none;
    &.leaf-left {
      background-image: url("../assets/leaf-left.png");
    }
    &.leaf-orange {
      background-image: url("../assets/leaf-orange.png");
    }
    &.leaf-right {
      background-image: url("../assets/leaf-right.png");
    }
    &.leaf-top1 {
      background-image: url("../assets/leaf-top1.png");
    }
    &.leaf-top2 {
      background-image: url("../assets/leaf-top2.png");
    }
    &.leaf-top3 {
      background-image: url("../assets/leaf-top3.png");
    }
    &.leaf-top4 {
      background-image: url("../assets/leaf-top4.png");
    }
    &.leaf-top5 {
      background-image: url("../assets/leaf-top5.png");
    }
  }
}

#townsquare.public .token {
  background-image: url("../assets/life.png");
  div {
    display: none;
  }
  &:before,
  &:after,
  span {
    display: none;
  }
}

#townsquare.public .player.dead .token {
  background-image: url("../assets/death.png");
}

#townsquare.public .player.traveller .token {
  filter: grayscale(100%);
}

/***** Player name *****/
.name {
  font-size: 120%;
  line-height: 120%;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000,
    2px 2px 0 #000, 0 0 10px rgba(0, 0, 0, 0.75);
  cursor: pointer;
}

/***** Ability text *****/
#townsquare.public .ability {
  display: none;
}
.circle .ability {
  position: absolute;
  padding: 5px 10px;
  top: 20px;
  right: 100%;
  width: 200px;
  z-index: 25;
  font-size: 80%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  border: 3px solid black;
  text-align: left;
  display: none;
  &:after {
    content: " ";
    border: 10px solid transparent;
    position: absolute;
    left: 100%;
    width: 0;
    height: 0;
    border-left-color: black;
    top: 20px;
    margin: 0 2px;
  }
}

.player:hover .ability {
  display: block;
}

/***** Reminder token *****/
.circle .reminder {
  background: url("../assets/reminder.png") center center;
  background-size: 100%;
  width: $token / 2;
  height: $token / 2;
  color: black;
  font-size: 50%;
  font-weight: bold;
  display: block;
  margin: 5px ($token / -4) 0;
  text-align: center;
  padding-top: $token * 0.3;
  border-radius: 50%;
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
  display: none;
}
</style>
