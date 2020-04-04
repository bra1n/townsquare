<template>
  <div  id="townsquare" class="square" v-bind:class="{ public: isPublic }">
    <ul class="circle" v-bind:class="['size-' + players.length]">
      <Player
          v-for="player in players"
          :key="player.name"
          :player="player"
          :roles="roles"
          :is-public="isPublic"
          @add-reminder="openReminderModal"
      ></Player>
    </ul>
    <Modal v-show="availableReminders.length" @close="closeModal">
      <ul class="reminders">
        <li v-for="reminder in availableReminders" class="reminder"
            v-bind:class="[reminder.role]"
            @click="addReminder(reminder)">
          {{ reminder.name }}
        </li>
      </ul>
    </Modal>
  </div>
</template>

<script>
  import roles from '../roles.json'
  import Player from './Player'
  import Modal from "./Modal";

  export default {
    components: {
      Modal,
      Player
    },
    props: ['isPublic'],
    data () {
      return {
        players: [
          { name: "Steffen", role: "baron", reminders: [{ role: 'imp', name: 'Die' }] },
          { name: "Tino", role: "imp" },
          { name: "Basti", role: "chef", reminders: [] },
          { name: "Bernd", role: "ravenkeeper", reminders: [] },
          { name: "Tim", role: "drunk", reminders: [] },
          { name: "Yann", role: "librarian", reminders: [] },
          { name: "Marie", role: "empath", reminders: [] },
          { name: "Bogdan", role: "scarletwoman", reminders: [] },
          { name: "Sean", role: "recluse", reminders: [] },
          { name: "Petra", role: "undertaker", reminders: [] },
        ],
        roles: new Map(roles.map(role => [role.id, role])),
        selectedPlayer: false,
        availableReminders: [],
        availableRoles: [],
      }
    },
    methods: {
      openReminderModal (player) {
        this.selectedPlayer = player;
        this.availableReminders = [];
        this.roles.forEach(role => {
          if (this.players.some(p => p.role === role.id)) {
            this.availableReminders = [
              ...this.availableReminders,
              ...role.reminders.map(name => ({role: role.id, name}))
            ];
          }
        });
        console.log('open', player.reminders);
      },
      addReminder (reminder) {
        this.selectedPlayer.reminders.push(reminder);
        this.closeModal();
      },
      closeModal () {
        this.selectedPlayer = false;
        this.availableReminders = [];
        this.availableRoles = [];
      }
    }
  }
</script>

<style lang="scss">
  @import '../roles.scss';

  @mixin on-circle($item-count) {
    $angle: (360 / $item-count);
    $rot: 0;

    @for $i from 1 through $item-count {
      &:nth-child(#{$i}) {
        transform: rotate($rot * 1deg);
        @if $i - 1 <= $item-count / 2 {
          z-index: $item-count - $i + 1;
          .ability {
            left: 100%; right: auto;
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

  .circle {
    padding: 0;
    width: 100%;
    height: 100%;
    list-style: none;
    overflow: hidden;
    position: relative;
    margin: 0;
    box-sizing: border-box;

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

  @for $i from 5 through 20 {
    .circle.size-#{$i} li {
      @include on-circle($item-count: $i);
    }
  }

  #townsquare {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    box-sizing: border-box;
    padding: 20px;
  }

  // player circle
  .circle {
    background: url('../assets/demon-head2.png') center center no-repeat;
    background-size: 10%;
  }

  #townsquare.public .circle {
    background-image: url('../assets/demon-head.png');
  }

  /***** Reminder token modal ******/
  ul.reminders {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    overflow: hidden;
    justify-content: center;

    .reminder {
      background: url('../assets/reminder.png') center center;
      background-size: 100%;
      width: 100px;
      height: 100px;
      color: black;
      font-size: 65%;
      font-weight: bold;
      display: block;
      margin: 5px;
      text-align: center;
      position: relative;
      border-radius: 50%;
      border: 3px solid black;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      cursor: pointer;
      box-sizing: border-box;
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
