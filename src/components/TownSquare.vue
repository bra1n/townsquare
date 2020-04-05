<template>
  <div id="townsquare" class="square" v-bind:class="{ public: isPublic }">
    <ul class="circle" v-bind:class="['size-' + players.length]">
      <Player
        v-for="(player, index) in players"
        :key="index"
        :player="player"
        :roles="roles"
        :is-public="isPublic"
        @add-reminder="openReminderModal"
        @set-role="openRoleModal"
        @remove-player="removePlayer"
      ></Player>
    </ul>
    <Modal v-show="availableReminders.length" @close="closeModal">
      <h2>Choose a reminder token:</h2>
      <ul class="reminders">
        <li
          v-for="reminder in availableReminders"
          class="reminder"
          v-bind:class="[reminder.role]"
          v-bind:key="reminder.role + ' ' + reminder.name"
          @click="addReminder(reminder)"
        >
          {{ reminder.name }}
        </li>
      </ul>
    </Modal>
    <Modal v-show="availableRoles.length" @close="closeModal">
      <h2>Choose a new role:</h2>
      <ul class="tokens">
        <li
          v-for="role in availableRoles"
          class="token"
          v-bind:class="[role.id, role.team]"
          v-bind:key="role.id"
          @click="setRole(role)"
        >
          {{ role.name }}
        </li>
      </ul>
    </Modal>
  </div>
</template>

<script>
import Player from "./Player";
import Modal from "./Modal";

export default {
  components: {
    Modal,
    Player
  },
  props: {
    isPublic: {
      type: Boolean,
      required: true
    },
    players: {
      type: Array,
      required: true
    },
    roles: {
      type: Map,
      required: true
    }
  },
  data() {
    return {
      selectedPlayer: false,
      availableReminders: [],
      availableRoles: []
    };
  },
  methods: {
    openReminderModal(player) {
      this.selectedPlayer = player;
      this.availableReminders = [];
      this.roles.forEach(role => {
        if (this.players.some(p => p.role.id === role.id)) {
          this.availableReminders = [
            ...this.availableReminders,
            ...role.reminders.map(name => ({ role: role.id, name }))
          ];
        }
      });
      this.availableReminders.push({ role: "good", name: "Good" });
      this.availableReminders.push({ role: "evil", name: "Evil" });
    },
    openRoleModal(player) {
      this.selectedPlayer = player;
      this.availableRoles = [];
      this.roles.forEach(role => {
        if (role.id !== player.role) {
          this.availableRoles.push(role);
        }
      });
      this.availableRoles.push({});
    },
    addReminder(reminder) {
      this.selectedPlayer.reminders.push(reminder);
      this.closeModal();
    },
    setRole(role) {
      this.selectedPlayer.role = role;
      this.closeModal();
    },
    closeModal() {
      this.selectedPlayer = false;
      this.availableReminders = [];
      this.availableRoles = [];
    },
    removePlayer(player) {
      if (confirm(`Do you really want to remove ${player.name}?`)) {
        this.players.splice(this.players.indexOf(player), 1);
      }
    }
  }
};
</script>

<style lang="scss">
@import "../vars.scss";

@each $img, $fontsize in $roles {
  .token.#{$img} {
    &:before {
      background-image: url("../assets/icons/#{$img}.png");
    }
    font-size: $fontsize;
  }

  .reminder.#{$img}:before {
    background-image: url("../assets/icons/#{$img}.png");
  }
}

.circle {
  padding: 0;
  width: 100%;
  height: 100%;
  list-style: none;
  overflow: hidden;
  margin: 0;

  li {
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
      margin-left: -100px;
      width: 200px;
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
        .ability {
          left: 100%;
          right: auto;
          &:after {
            border-left-color: transparent;
            border-right-color: black;
            left: auto;
            right: 100%;
          }
        }
      } @else {
        z-index: $i - 1;
      }
      > * {
        transform: rotate($rot * -1deg);
      }
    }
    $rot: $rot + $angle;
  }
}

@for $i from 1 through 20 {
  .circle.size-#{$i} li {
    @include on-circle($item-count: $i);
  }
}

#townsquare {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 20px;
}

/***** Role token modal ******/
ul.tokens {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  overflow: hidden;
  justify-content: center;
  font-size: 75%;
  line-height: 100%;

  .token {
    border-radius: 50%;
    height: 120px;
    width: 120px;
    background: url("../assets/token.png") center center;
    background-size: 100%;
    text-align: center;
    color: black;
    margin: 5px;
    font-weight: 600;
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
      1px 1px 0 #fff, 0 0 5px rgba(0, 0, 0, 0.75);
    padding-top: 85px;
    font-family: "Papyrus", serif;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    transition: transform 500ms ease;

    &.townsfolk {
      box-shadow: 0 0 10px $townsfolk, 0 0 10px #004cff;
    }
    &.outsider {
      box-shadow: 0 0 10px $outsider, 0 0 10px $outsider;
    }
    &.minion {
      box-shadow: 0 0 10px $minion, 0 0 10px $minion;
    }
    &.demon {
      box-shadow: 0 0 10px $demon, 0 0 10px $demon;
    }
    &.traveller {
      box-shadow: 0 0 10px $traveller, 0 0 10px $traveller;
    }

    &:before {
      content: " ";
      background-size: 100%;
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
    }

    &:hover {
      transform: scale(1.2);
    }
  }
}

/***** Reminder token modal ******/
ul.reminders {
  @extend .tokens;

  .reminder {
    background: url("../assets/reminder.png") center center;
    background-size: 100%;
    width: 100px;
    height: 100px;
    color: black;
    font-size: 65%;
    font-weight: bold;
    display: block;
    margin: 5px;
    text-align: center;
    border-radius: 50%;
    border: 3px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    padding-top: 65px;
    transition: transform 500ms ease;

    &:before {
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-size: 100%;
      background-position: center 0;
      background-repeat: no-repeat;
    }

    &:hover {
      transform: scale(1.2);
    }
  }
}
</style>
