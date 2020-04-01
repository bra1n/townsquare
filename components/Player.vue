<template>
  <li>
    <div class="player"
         :class="{ dead: player.hasDied, 'no-vote': player.hasVoted }">
      <div class="shroud" @click="toggleStatus()"></div>
      <div class="token" @click="changeRole()" :class="[player.role]">
        <span class="leaf-left" v-if="role.firstNight"></span>
        <span class="leaf-right" v-if="role.otherNight"></span>
        <span v-if="role.reminders.length" v-bind:class="['leaf-top' + role.reminders.length]"></span>
        <span class="leaf-orange" v-if="role.setup"></span>
      </div>
      <div class="name">{{ player.name }}</div>
    </div>
    <div class="reminder add"></div>
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
    data () {
      return {
        role: this.roles.get(this.player.role) || { reminders: [] }
      }
    },
    methods: {
      toggleStatus () {
        if (!this.isPublic || !this.player.hasDied) {
          this.$set(this.player, 'hasDied', !this.player.hasDied);
          if (!this.player.hasDied) {
            this.$set(this.player, 'hasVoted', false);
          }
        } else {
          this.$set(this.player, 'hasVoted', !this.player.hasVoted);
        }
      },
      changeRole () {
        if (!this.isPublic) {
          console.log('role change');
        } else {
          this.toggleStatus();
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '../roles.scss';

  // token size
  $token: 150px;

  /***** Player token *****/
  .circle .player {
    margin-bottom: 10px;

    .shroud {
      content: " ";
      background: url('../img/shroud.png') center -10px no-repeat;
      background-size: auto 100%;
      position: absolute;
      margin-left: -2/6 * $token;
      width: 2/3 * $token;
      height: 2/3 * $token;
      left: 50%;
      top: 0;
      cursor: pointer;
      opacity: 0;
      transition: opacity 200ms;
      z-index: 2;
      &:hover { opacity: 0.5; }
    }

    &.dead .shroud { opacity: 1; }
    &.dead .name { color: #999; }
  }

  #townsquare.public .player.dead {
    &:after {
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: url('../img/vote.png') center center no-repeat;
      background-size: 40%;
      height: $token + 3px;
      pointer-events: none;
    }
    &.traveller:after { filter: grayscale(100%); }
    &.no-vote:after { display: none; }
  }

  #townsquare.public .player .shroud { display: none; }

  /***** Role token ******/
  .circle .token {
    border-radius: 50%;
    height: $token + 3px;
    width: $token + 3px;
    background: url('../img/token.png') center center;
    background-size: 100%;
    text-align: center;
    position: relative;
    color: black;
    margin: auto;
    font-weight: 600;
    text-shadow:
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff,
        0 0 5px rgba(0,0,0,0.75);
    padding-top: $token * 0.7;
    box-sizing: border-box;
    font-family: 'Papyrus', serif;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
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
      &.leaf-left { background-image: url('../img/leaf-left.png'); }
      &.leaf-orange { background-image: url('../img/leaf-orange.png'); }
      &.leaf-right { background-image: url('../img/leaf-right.png'); }
      &.leaf-top1 { background-image: url('../img/leaf-top1.png'); }
      &.leaf-top2 { background-image: url('../img/leaf-top2.png'); }
      &.leaf-top3 { background-image: url('../img/leaf-top3.png'); }
      &.leaf-top4 { background-image: url('../img/leaf-top4.png'); }
      &.leaf-top5 { background-image: url('../img/leaf-top5.png'); }
    }
  }

  #townsquare.public .token {
    background-image: url('../img/life.png');
    &:before, &:after, span { display: none; }
  }

  #townsquare.public .player.dead .token {
    background-image: url('../img/death.png');
  }

  #townsquare.public .player.traveller .token {
    filter: grayscale(100%);
  }

  /***** Player name *****/
  .name {
    font-size: 120%;
    line-height: 120%;
    text-shadow:
        -2px -2px 0 #000,
        2px -2px 0 #000,
        -2px 2px 0 #000,
        2px 2px 0 #000,
        0 0 10px rgba(0,0,0,0.75);
  }

  /***** Reminder token *****/
  .circle .reminder {
    background: url('../img/reminder.png') center center;
    background-size: 100%;
    width: $token / 2;
    height: $token / 2;
    color: black;
    font-size: 50%;
    font-weight: bold;
    display: block;
    margin: 5px ($token / -4) 0;
    text-align: center;
    position: relative;
    box-sizing: border-box;
    padding-top: $token * 0.3;
    border-radius: 50%;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    transition: opacity 200ms;
    cursor: pointer;

    &:before, &:after {
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-size: 100%;
      background-position: center 0;
      background-repeat: no-repeat;
      background-image: url('../img/icon-plus.png');
      transition: opacity 200ms;
    }

    &:after {
      background-image: url('../img/icon-x.png');
      opacity: 0;
    }

    &.add {
      opacity: 0;
      &:after { display: none; }
    }

    &:hover:before { opacity: 0; }
    &:hover:after { opacity: 1; }
  }
  .circle li:hover .reminder.add, { opacity: 1; }
  .circle li:hover .reminder.add:before { opacity: 1; }

  #townsquare.public .reminder { display: none; }
</style>
