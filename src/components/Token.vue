<template>
  <div class="token" @click="setRole" :class="[role.id]">
    <span
      class="icon"
      v-if="role.id"
      v-bind:style="{
        backgroundImage: `url(${require('../assets/icons/' +
          role.id +
          '.png')})`
      }"
    ></span>
    <span class="leaf-left" v-if="role.firstNight"></span>
    <span class="leaf-right" v-if="role.otherNight"></span>
    <span
      v-if="role.reminders && role.reminders.length"
      v-bind:class="['leaf-top' + role.reminders.length]"
    ></span>
    <span class="leaf-orange" v-if="role.setup"></span>
    <svg viewBox="0 0 150 150" class="name">
      <path
        d="M 13 75 C 13 160, 138 160, 138 75"
        id="curve"
        fill="transparent"
      />
      <text
        width="150"
        x="66.6%"
        text-anchor="middle"
        class="label"
        v-bind:font-size="role.name | nameToFontSize"
      >
        <textPath xlink:href="#curve">
          {{ role.name }}
        </textPath>
      </text>
    </svg>
    <div
      class="edition"
      v-bind:class="[`edition-${role.edition}`, role.team]"
    ></div>
    <div class="ability" v-if="role.ability">
      {{ role.ability }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Token",
  props: {
    role: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {};
  },
  filters: {
    nameToFontSize: name => (name && name.length > 10 ? "85%" : "110%")
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
  width: 100%;
  background: url("../assets/token.png") center center;
  background-size: 100%;
  text-align: center;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    background-size: 100%;
    position: absolute;
    width: 100%;
    height: 100%;
    margin-top: 3%;
  }

  span {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 100%;
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

  .name {
    width: 100%;
    height: 100%;
    .label {
      fill: black;
      stroke: white;
      stroke-width: 2px;
      paint-order: stroke;
      font-family: "Papyrus", serif;
      font-weight: bold;
      text-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
      letter-spacing: 1px;
    }
  }

  .edition {
    position: absolute;
    right: 0;
    bottom: 5px;
    width: 30px;
    height: 30px;
    background-size: 100%;
    display: none;
  }

  .ability {
    display: flex;
    position: absolute;
    padding: 5px 10px;
    left: 120%;
    width: 250px;
    z-index: 25;
    font-size: 80%;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    border: 3px solid black;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
    text-align: left;
    justify-items: center;
    align-content: center;
    align-items: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease-in-out;

    &:before {
      content: " ";
      border: 10px solid transparent;
      width: 0;
      height: 0;
      border-right-color: black;
      position: absolute;
      margin-right: 2px;
      right: 100%;
    }

    #app.screenshot & {
      display: none;
    }
  }

  &:hover .ability {
    opacity: 1;
  }
}
</style>
