<template>
  <div id="townsquare" class="square"  v-bind:class="{ public: isPublic }">
    <TownSquare :is-public="isPublic"></TownSquare>
    <div class="controls">
      <button v-on:click="togglePublic">Toggle</button>
    </div>
  </div>
</template>

<script>
  import TownSquare from './components/TownSquare.vue'

  export default {
    components: {
      TownSquare
    },
    data: () => ({
      isPublic: false
    }),
    methods: {
      togglePublic () {
        this.isPublic = !this.isPublic;
      }
    }
  }
</script>

<style lang="scss">
  @font-face { font-family: "Papyrus";
    src: url("fonts/papyrus.eot"); /* IE9*/
    src: url("fonts/papyrus.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("fonts/papyrus.woff2") format("woff2"), /* chrome firefox */
    url("fonts/papyrus.woff") format("woff"), /* chrome firefox */
    url("fonts/papyrus.ttf") format("truetype"), /* chrome firefox opera Safari, Android, iOS 4.2+*/
    url("fonts/papyrus.svg#PapyrusW01") format("svg"); /* iOS 4.1- */
  }

  html, body {
    font-size: 1.2em;
    line-height: 1.4;
    background: url('img/background.jpg') center center;
    background-size: cover;
    color: white;
    height: 100%;
    font-family: 'Roboto Condensed', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 0;
    margin: 0;
  }

  #townsquare {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    box-sizing: border-box;
    padding: 20px;
  }

  // Controls
  .controls {
    position: absolute;
    right: 0;
    top: 0;
  }
</style>
