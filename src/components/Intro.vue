<template>
  <div class="intro">
    <img src="static/apple-icon.png" alt="" />
    Welcome to the (unofficial)
    <b> Virtual Blood on the Clocktower Town Square</b>!<br />
    Please add more players through the
    <span class="button" @click="toggleMenu">
      <font-awesome-icon icon="cog" /> Menu
    </span>
    on the top right or by pressing <b>[A]</b>.<br />
    This project is free and open source and can be found on
    <a href="https://github.com/bra1n/townsquare" target="_blank">GitHub</a>.
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  methods: mapMutations(["toggleMenu"])
};
</script>

<style scoped lang="scss">
// Intro
.intro {
  text-align: center;
  width: 50%;
  font-size: 120%;
  position: absolute;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid black;
  border-radius: 10px;
  z-index: 3;
  img {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 25vh;
    margin-left: -12.5vh;
    margin-bottom: 2vh;
    max-width: 192px;
    border-radius: 50%;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
  }
}
</style>
