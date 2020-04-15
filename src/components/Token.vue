<template>
  <div class="token" @click="setRole" :class="[role.id]">
    <span class="leaf-left" v-if="role.firstNight"></span>
    <span class="leaf-right" v-if="role.otherNight"></span>
    <span
      v-if="role.reminders && role.reminders.length"
      v-bind:class="['leaf-top' + role.reminders.length]"
    ></span>
    <span class="leaf-orange" v-if="role.setup"></span>
    <div>{{ role.name }}</div>
  </div>
</template>

<script>
export default {
  name: "Token",
  props: {
    role: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    setRole() {
      this.$emit("set-role");
    }
  }
};
</script>

<style scoped lang="scss">
.token {
  border-radius: 50%;
  height: 100%;
  width: 100%;
  background: url("../assets/token.png") center center;
  background-size: 100%;
  text-align: center;
  color: black;
  font-weight: 600;
  text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
    1px 1px 0 #fff, 0 0 5px rgba(0, 0, 0, 0.75);
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

  div {
    position: absolute;
    top: 73%;
    width: 100%;
    line-height: 100%;
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
</style>
