<template>
  <div
    id="app"
    @keyup="keyup"
    tabindex="-1"
    v-bind:class="{
      screenshot: grimoire.isScreenshot,
      night: grimoire.isNight
    }"
    v-bind:style="{
      backgroundImage: grimoire.background
        ? `url('${grimoire.background}')`
        : ''
    }"
  >
    <div class="backdrop"></div>
    <transition name="blur">
      <Intro v-if="!players.length"></Intro>
      <TownInfo v-if="players.length && !session.nomination"></TownInfo>
      <Vote v-if="session.nomination"></Vote>
    </transition>
    <TownSquare @screenshot="takeScreenshot"></TownSquare>
    <Menu ref="menu"></Menu>
    <EditionModal />
    <FabledModal />
    <RolesModal />
    <ReferenceModal />
    <NightOrderModal />
    <Gradients />
    <span id="version">v{{ version }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { version } from "../package.json";
import TownSquare from "./components/TownSquare";
import TownInfo from "./components/TownInfo";
import Menu from "./components/Menu";
import RolesModal from "./components/modals/RolesModal";
import EditionModal from "./components/modals/EditionModal";
import Intro from "./components/Intro";
import ReferenceModal from "./components/modals/ReferenceModal";
import Vote from "./components/Vote";
import Gradients from "./components/Gradients";
import NightOrderModal from "./components/modals/NightOrderModal";
import FabledModal from "@/components/modals/FabledModal";

export default {
  components: {
    FabledModal,
    NightOrderModal,
    Vote,
    ReferenceModal,
    Intro,
    TownInfo,
    TownSquare,
    Menu,
    EditionModal,
    RolesModal,
    Gradients
  },
  computed: {
    ...mapState(["grimoire", "session"]),
    ...mapState("players", ["players"])
  },
  data() {
    return {
      version
    };
  },
  methods: {
    takeScreenshot(dimensions) {
      this.$refs.menu.takeScreenshot(dimensions);
    },
    keyup({ key, ctrlKey, metaKey }) {
      if (ctrlKey || metaKey) return;
      switch (key.toLocaleLowerCase()) {
        case "g":
          this.$store.commit("toggleGrimoire");
          break;
        case "a":
          this.$refs.menu.addPlayer();
          break;
        case "h":
          this.$refs.menu.hostSession();
          break;
        case "j":
          this.$refs.menu.joinSession();
          break;
        case "r":
          this.$store.commit("toggleModal", "reference");
          break;
        case "n":
          this.$store.commit("toggleModal", "nightOrder");
          break;
        case "e":
          if (this.session.isSpectator) return;
          this.$store.commit("toggleModal", "edition");
          break;
        case "c":
          if (this.session.isSpectator) return;
          this.$store.commit("toggleModal", "roles");
          break;
        case "escape":
          this.$store.commit("toggleModal");
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

@font-face {
  font-family: PiratesBay;
  src: url("assets/fonts/piratesbay.ttf");
  font-display: swap;
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

// Large devices (desktops, less than 1200px)
@media screen and (max-width: 1199.98px) {
  html,
  body {
    font-size: 1.1em;
  }
  .night-order em {
    width: 30px;
    height: 30px;
  }
  .fabled .night-order.first span {
    left: 30px;
  }
}

// Medium devices (tablets, less than 992px)
@media screen and (max-width: 991.98px) {
  html,
  body {
    font-size: 1em;
  }
  #controls svg {
    font-size: 20px;
  }
  .night-order em {
    width: 20px;
    height: 20px;
  }
  .fabled .night-order.first span {
    left: 20px;
  }
  #townsquare {
    padding: 10px;
  }
}

// Small devices (landscape phones, less than 768px)
@media screen and (max-width: 767.98px) {
  html,
  body {
    font-size: 0.9em;
  }
  .player > .name {
    top: 0;
  }
}

// Old phones
@media screen and (max-width: 575.98px) {
  html,
  body {
    font-size: 0.8em;
  }
}

// odd aspect ratio
@media (max-aspect-ratio: 11/7) {
  .bluffs,
  .fabled {
    h3 {
      max-width: 14vh;
    }
    ul {
      flex-direction: column;
    }
  }
}

// Firefox doesn't support screenshot mode yet
@-moz-document url-prefix() {
  #controls > span.camera,
  .player > .menu .screenshot,
  .bluffs > svg.fa-camera {
    display: none;
  }
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
  font-family: PiratesBay, sans-serif;
  letter-spacing: 1px;
  font-weight: normal;
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

#version {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 60%;
  opacity: 0.5;
}

.blur-enter-active,
.blur-leave-active {
  transition: all 250ms;
  filter: blur(0);
}
.blur-enter,
.blur-leave-to {
  opacity: 0;
  filter: blur(20px);
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
  line-height: 170%;
  margin: 5px auto;
  cursor: pointer;
  transition: all 200ms;
  white-space: nowrap;
  &:hover {
    color: red;
  }
  &.disabled {
    color: gray;
    cursor: default;
    opacity: 0.75;
  }
  &:before,
  &:after {
    content: " ";
    display: inline-block;
    width: 10px;
    height: 10px;
  }
  &.townsfolk {
    background: radial-gradient(
          at 0 -15%,
          rgba(255, 255, 255, 0.07) 70%,
          rgba(255, 255, 255, 0) 71%
        )
        0 0/80% 90% no-repeat content-box,
      linear-gradient(#0031ad, rgba(5, 0, 0, 0.22)) content-box,
      linear-gradient(#292929, #001142) border-box;
    box-shadow: inset 0 1px 1px #002c9c, 0 0 10px #000;
    &:hover:not(.disabled) {
      color: #008cf7;
    }
  }
  &.demon {
    background: radial-gradient(
          at 0 -15%,
          rgba(255, 255, 255, 0.07) 70%,
          rgba(255, 255, 255, 0) 71%
        )
        0 0/80% 90% no-repeat content-box,
      linear-gradient(#ad0000, rgba(5, 0, 0, 0.22)) content-box,
      linear-gradient(#292929, #420000) border-box;
    box-shadow: inset 0 1px 1px #9c0000, 0 0 10px #000;
  }
}

/* Night phase backdrop */
#app > .backdrop {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  pointer-events: none;
  background: black;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(1, 22, 46, 1) 50%,
    rgba(0, 39, 70, 1) 100%
  );
  opacity: 0;
  transition: opacity 1s ease-in-out;
  &:after {
    content: " ";
    display: block;
    width: 100%;
    padding-right: 2000px;
    height: 100%;
    background: url("assets/clouds.png") repeat;
    background-size: 2000px auto;
    animation: move-background 120s linear infinite;
    opacity: 0.3;
  }
}

@keyframes move-background {
  from {
    transform: translate3d(-2000px, 0px, 0px);
  }
  to {
    transform: translate3d(0px, 0px, 0px);
  }
}

#app.night > .backdrop {
  opacity: 0.5;
}
</style>
