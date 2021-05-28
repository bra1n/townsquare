<template>
  <div class="intro">
    <img src="static/apple-icon.png" alt="" />
    <i18n
      path="Welcome to the (unofficial) {grimoire} for Blood on the Clocktower ! Please add more players through the {menu} on the top right or by pressing {a-key}. You can also join a game session by pressing {j-key}."
    >
      <template #menu>
        <span class="button" @click="toggleMenu">
          <font-awesome-icon icon="cog" /> {{ $t("Menu") }}</span
        >
      </template>
      <template #grimoire>
        <b>{{ $t("Virtual Town Square and Grimoire") }}</b>
      </template>
      <template #a-key>
        <b>[A]</b>
      </template>
      <template #j-key>
        <b>[J]</b>
      </template>
    </i18n>
    <br />
    <div class="footer">
      <i18n
        path='This project is free and open source and can be found on {github}. It is not affiliated with The Pandemonium Institute. "Blood on the Clocktower" is a trademark of Steven Medway and The Pandemonium Institute.'
      >
        <template #github>
          <a href="https://github.com/bra1n/townsquare" target="_blank"
            >GitHub</a
          >
        </template>
      </i18n>
    </div>
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
  a {
    color: white;
  }
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
  .footer {
    font-size: 60%;
    opacity: 0.75;
  }
}
</style>
