<template>
  <!-- SVG Gradients -->
  <div id="gradients">
    <svg
      width="0"
      height="0"
      v-for="(gradient, index) in gradients"
      :key="index"
    >
      <linearGradient :id="gradient[0]" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop
          offset="0%"
          :style="{ 'stop-color': gradient[2], 'stop-opacity': 1 }"
        ></stop>
        <stop
          offset="100%"
          :style="{ 'stop-color': gradient[1], 'stop-opacity': 1 }"
        ></stop>
      </linearGradient>
    </svg>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gradients: [
        ["demon", "#ce0100", "#000"],
        ["townsfolk", "#1f65ff", "#000"],
        ["default", "#4E4E4E", "#000"]
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
svg {
  position: absolute;
  z-index: -1;
}
</style>
