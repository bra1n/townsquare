<template>
  <div
    id="app"
    @keyup="keyup"
    tabindex="-1"
    v-bind:class="{ screenshot: grimoire.isScreenshot }"
    v-bind:style="{
      backgroundImage: grimoire.background
        ? `url('${grimoire.background}')`
        : ''
    }"
  >
    <Intro v-if="!players.length"></Intro>
    <TownInfo :players="players" v-if="players.length"></TownInfo>
    <TownSquare :players="players" @screenshot="takeScreenshot"></TownSquare>
    <Menu ref="menu" :players="players"></Menu>
    <EditionSelectionModal :players="players"></EditionSelectionModal>
    <RoleSelectionModal :players="players"></RoleSelectionModal>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TownSquare from "./components/TownSquare";
import TownInfo from "./components/TownInfo";
import Menu from "./components/Menu";
import RoleSelectionModal from "./components/RoleSelectionModal";
import EditionSelectionModal from "./components/EditionSelectionModal";
import Intro from "./components/Intro";

export default {
  components: {
    Intro,
    EditionSelectionModal,
    Menu,
    TownSquare,
    TownInfo,
    RoleSelectionModal
  },
  computed: mapState({
    grimoire: state => state.grimoire,
    players: state => state.players.players
  }),
  data: function() {
    return {};
  },
  methods: {
    takeScreenshot(dimensions) {
      this.$refs.menu.takeScreenshot(dimensions);
    },
    keyup({ key }) {
      switch (key) {
        case "g":
          this.$store.commit("toggleGrimoire");
          break;
        case "a":
          this.$refs.menu.addPlayer();
          break;
        case "r":
          this.$refs.menu.randomizeSeatings();
          break;
        case "e":
          this.$store.commit("toggleModal", "edition");
          break;
        case "c":
          this.$store.commit("toggleModal", "roles");
          break;
        case "Escape":
          this.$store.commit("toggleMenu");
      }
    }
  }
};
</script>

<style lang="scss">
@import "vars";

@font-face {
  font-family: "Papyrus";
  src: url("assets/fonts/papyrus.eot"); /* IE9*/
  src: url("assets/fonts/papyrus.eot?#iefix") format("embedded-opentype"),
    /* IE6-IE8 */ url("assets/fonts/papyrus.woff2") format("woff2"),
    /* chrome firefox */ url("assets/fonts/papyrus.woff") format("woff"),
    /* chrome firefox */ url("assets/fonts/papyrus.ttf") format("truetype"),
    /* chrome firefox opera Safari, Android, iOS 4.2+*/
      url("assets/fonts/papyrus.svg#PapyrusW01") format("svg"); /* iOS 4.1- */
}

html,
body {
  font-size: 1.2em;
  line-height: 1.4;
  background: url("assets/background.jpg") center center;
  background-size: cover;
  color: white;
  height: 100%;
  font-family: "Roboto Condensed", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
  position: relative;
}

a {
  color: $townsfolk;
  &:hover {
    color: $demon;
  }
}

h1,
h2,
h3,
h4,
h5 {
  margin: 0;
  text-align: center;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#app {
  height: 100%;
  background-position: center center;
  background-size: cover;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
}

// Buttons
.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  .button {
    margin: 5px 0;
    border-radius: 0;
    &:first-child {
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
    }
    &:last-child {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
}
.button {
  padding: 0;
  border: solid 0.125em transparent;
  border-radius: 15px;
  box-shadow: inset 0 1px 1px #9c9c9c, 0 0 10px #000;
  background: radial-gradient(
        at 0 -15%,
        rgba(#fff, 0.07) 70%,
        rgba(#fff, 0) 71%
      )
      0 0/ 80% 90% no-repeat content-box,
    linear-gradient(#4e4e4e, #040404) content-box,
    linear-gradient(#292929, #010101) border-box;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
  line-height: 40px;
  margin: 5px auto;
  font-size: 1em;
  cursor: pointer;
  transition: all 200ms;
  &:hover {
    color: red;
  }
  &.disabled {
    color: gray;
    cursor: default;
  }
  &:before,
  &:after {
    content: " ";
    display: inline-block;
    width: 10px;
    height: 10px;
  }
}
</style>
