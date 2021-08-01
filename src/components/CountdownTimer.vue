<template>
  <div class="countdown-timer">
    <div
      id="timer"
      v-bind:style="[
        remainingSeconds <= 30 ? { color: 'red' } : { color: 'white' }
      ]"
    >
      {{ formattedMinutes }}:{{ formattedSeconds }}
    </div>
    <div class="timer-control" v-if="!session.isSpectator">
      <div class="timer-button" @click="startTimer" v-if="!isTicking">
        <font-awesome-icon icon="play"></font-awesome-icon>
      </div>
      <div class="timer-button" @click="pauseTimer" v-if="isTicking">
        <font-awesome-icon icon="pause"></font-awesome-icon>
      </div>
      <div class="timer-button" @click="stopTimer">
        <font-awesome-icon icon="stop"></font-awesome-icon>
      </div>
      <div class="timer-button" @click="addMinute" v-if="!isTicking">
        <font-awesome-icon icon="plus"></font-awesome-icon>
      </div>
      <div class="timer-button" @click="subtractMinute" v-if="!isTicking">
        <font-awesome-icon icon="minus"></font-awesome-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CountdownTimer",
  computed: {
    ...mapState(["session"]),
    remainingSeconds: {
      get: function() {
        return this.$store.state.countdownTimer.remainingSeconds;
      },
      set: function(newValue) {
        this.$store.state.countdownTimer.remainingSeconds = newValue;
      }
    },
    totalSeconds: {
      get: function() {
        return this.$store.state.countdownTimer.totalSeconds;
      },
      set: function(newValue) {
        this.$store.state.countdownTimer.totalSeconds = newValue;
      }
    },
    isTicking: {
      get: function() {
        return this.$store.state.countdownTimer.isTicking;
      },
      set: function(newValue) {
        this.$store.state.countdownTimer.isTicking = newValue;
      }
    },
    formattedMinutes() {
      let minutes = Math.floor(this.remainingSeconds / 60);
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return minutes;
    },
    formattedSeconds() {
      let seconds = this.remainingSeconds % 60;
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return seconds;
    }
  },
  updated() {
    clearInterval(this.timerInterval);
    if (this.isTicking) {
      this.timerInterval = setInterval(this.elapseTimer, 1000);
    }
  },
  data: () => {
    return {
      timerInterval: null
    };
  },
  methods: {
    startTimer() {
      clearInterval(this.timerInterval);
      if (this.remainingSeconds === 0) {
        this.remainingSeconds = this.totalSeconds;
      }
      this.isTicking = true;
      this.sendTimerUpdate();
      this.timerInterval = setInterval(this.elapseTimer, 1000);
    },
    pauseTimer() {
      clearInterval(this.timerInterval);
      this.isTicking = false;
      this.sendTimerUpdate();
    },
    stopTimer() {
      clearInterval(this.timerInterval);
      this.remainingSeconds = this.totalSeconds;
      this.pauseTimer();
    },
    sendTimerUpdate() {
      if (this.session.isSpectator) return;
      let payload = {
        remainingSeconds: this.remainingSeconds,
        totalSeconds: this.totalSeconds,
        isTicking: this.isTicking
      };
      this.$store.commit("session/distributeTimerAction", payload);
    },
    elapseTimer() {
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        return;
      }
      this.remainingSeconds--;

      // Update local state on ST, so if a player joins while timer is ticking, they will get updated timer state.
      if (!this.session.isSpectator) {
        let payload = {
          remainingSeconds: this.remainingSeconds,
          totalSeconds: this.totalSeconds,
          isTicking: this.isTicking
        };
        this.$store.commit("session/updateTimerState", payload);
      }
    },
    addMinute() {
      this.totalSeconds += 60;
      this.remainingSeconds += 60;
      this.sendTimerUpdate();
    },
    subtractMinute() {
      this.totalSeconds = Math.max(0, this.totalSeconds - 60);
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 60);
      this.sendTimerUpdate();
    }
  }
};
</script>

<style scoped>
.countdown-timer {
  border-color: white;
  border-style: solid;
  border-width: thick;
  border-radius: 10px;
  padding: 5px 5px 5px;
}
.timer-control {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
}
.timer-button {
  margin: 0 5px 0 5px;
  filter: drop-shadow(0 2px 1px black);
}
#timer {
  font-weight: bold;
  text-align: center;
  text-shadow: 0 2px 1px black, 0 -2px 1px black, 2px 0 1px black,
    -2px 0 1px black;
  width: 100%;
}
</style>
