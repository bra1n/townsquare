<template>
  <Modal
    class="editions"
    v-show="modals.edition"
    @close="toggleModal('edition')"
  >
    <h3>Select an edition:</h3>
    <ul class="editions">
      <li
        v-for="edition in editions"
        class="edition"
        v-bind:class="['edition-' + edition.id]"
        v-bind:key="edition.id"
        @click="setEdition(edition.id)"
      >
        {{ edition.name }}
      </li>
    </ul>
  </Modal>
</template>

<script>
import editionJSON from "../editions";
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";

export default {
  components: {
    Modal
  },
  data: function() {
    return {
      editions: editionJSON
    };
  },
  computed: mapState(["modals"]),
  methods: mapMutations(["toggleModal", "setEdition"])
};
</script>

<style scoped lang="scss">
@import "../vars";

// Editions
@each $img, $skipIcons in $editions {
  .edition-#{$img} {
    background-image: url("../assets/editions/#{$img}.png");
  }
  @if $skipIcons != true {
    .edition-#{$img}.townsfolk {
      background-image: url("../assets/editions/#{$img}-townsfolk.png");
    }
    .edition-#{$img}.outsider {
      background-image: url("../assets/editions/#{$img}-outsider.png");
    }
    .edition-#{$img}.minion {
      background-image: url("../assets/editions/#{$img}-minion.png");
    }
    .edition-#{$img}.demon {
      background-image: url("../assets/editions/#{$img}-demon.png");
    }
  }
}

ul.editions .edition {
  text-align: center;
  padding-top: 100px;
  background-position: center center;
  background-size: 100% auto;
  background-repeat: no-repeat;
  width: 200px;
  margin: 5px;
  font-size: 120%;
  font-weight: bold;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000, 0 0 5px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  &:hover {
    color: red;
  }
}
</style>
