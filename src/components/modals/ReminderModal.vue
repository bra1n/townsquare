<template>
  <Modal
    v-show="modals.reminder && availableReminders.length"
    v-if="players[playerIndex]"
    @close="toggleModal('reminder')"
  >
    <h3>Choose a reminder token:</h3>
    <ul class="reminders">
      <li
        v-for="reminder in availableReminders"
        class="reminder"
        v-bind:class="[reminder.role]"
        v-bind:key="reminder.role + ' ' + reminder.name"
        @click="addReminder(reminder)"
      >
        <span
          class="icon"
          v-bind:style="{
            backgroundImage: `url(${require('../../assets/icons/' +
              reminder.role +
              '.png')})`
          }"
        ></span>
        {{ reminder.name }}
      </li>
    </ul>
  </Modal>
</template>

<script>
import Modal from "./Modal";
import { mapMutations, mapState } from "vuex";

export default {
  components: { Modal },
  props: ["playerIndex"],
  computed: {
    availableReminders() {
      let reminders = [];
      const players = this.$store.state.players.players;
      this.$store.state.roles.forEach(role => {
        if (players.some(p => p.role.id === role.id)) {
          reminders = [
            ...reminders,
            ...role.reminders.map(name => ({ role: role.id, name }))
          ];
        }
      });
      reminders.push({ role: "good", name: "Good" });
      reminders.push({ role: "evil", name: "Evil" });
      return reminders;
    },
    ...mapState(["modals"]),
    ...mapState("players", ["players"])
  },
  methods: {
    addReminder(reminder) {
      const player = this.$store.state.players.players[this.playerIndex];
      const value = [...player.reminders, reminder];
      this.$store.commit("players/update", {
        player,
        property: "reminders",
        value
      });
      this.$store.commit("toggleModal", "reminder");
    },
    ...mapMutations(["toggleModal"])
  }
};
</script>

<style scoped lang="scss">
ul.reminders .reminder {
  background: url("../../assets/reminder.png") center center;
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
  padding: 65px 9px 0;
  line-height: 100%;
  transition: transform 500ms ease;

  .icon {
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
</style>
