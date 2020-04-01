<template>
  <ul class="circle" v-bind:class="['size-' + players.length]">
    <Player
        v-for="player in players"
        :key="player.name"
        :player="player"
        :roles="roles"
        :is-public="isPublic"
    ></Player>
  </ul>
</template>

<script>
  import Player from './Player.vue'
  import roles from '../roles.json'

  export default {
    components: {
      Player
    },
    props: ['isPublic'],
    data () {
      return {
        players: [
          { name: "Steffen", role: "baron" },
          { name: "Tino", role: "imp" },
          { name: "Basti", role: "chef" },
          { name: "Bernd", role: "ravenkeeper" },
          { name: "Tim", role: "drunk" },
          { name: "Yann", role: "librarian" },
          { name: "Marie", role: "empath" },
          { name: "Bogdan", role: "scarletwoman" },
          { name: "Sean", role: "recluse" },
          { name: "Petra", role: "undertaker" },
        ],
        roles: new Map(roles.map(role => [role.name, role])),
      }
    }
  }
</script>

<style lang="scss">
  @mixin on-circle($item-count) {
    $angle: (360 / $item-count);
    $rot: 0;

    @for $i from 1 through $item-count {
      &:nth-child(#{$i}) {
        transform: rotate($rot * 1deg);
        @if $i - 1 <= $item-count / 2 {
          z-index: $item-count - $i + 1;
        } @else {
          z-index: $i - 1;
        }
        > * {
          transform: rotate($rot * -1deg);
        }
      }
      $rot: $rot + $angle;
    }
  }

  .circle {
    padding: 0;
    width: 100%;
    height: 100%;
    list-style: none;
    overflow: hidden;
    position: relative;
    margin: 0;
    box-sizing: border-box;

    li {
      position: absolute;
      top: 0;
      left: 50%;
      height: 50%;
      transform-origin: 0 100%;
      text-align: center;

      > * {
        margin-left: -100px;
        width: 200px;
      }
    }
  }

  .circle.size-5 li { @include on-circle($item-count: 5); }
  .circle.size-6 li { @include on-circle($item-count: 6); }
  .circle.size-7 li { @include on-circle($item-count: 7); }
  .circle.size-8 li { @include on-circle($item-count: 8); }
  .circle.size-9 li { @include on-circle($item-count: 9); }
  .circle.size-10 li { @include on-circle($item-count: 10); }
  .circle.size-11 li { @include on-circle($item-count: 11); }
  .circle.size-12 li { @include on-circle($item-count: 12); }
  .circle.size-13 li { @include on-circle($item-count: 13); }
  .circle.size-14 li { @include on-circle($item-count: 14); }
  .circle.size-15 li { @include on-circle($item-count: 15); }
  .circle.size-16 li { @include on-circle($item-count: 16); }
  .circle.size-17 li { @include on-circle($item-count: 17); }
  .circle.size-18 li { @include on-circle($item-count: 18); }
  .circle.size-19 li { @include on-circle($item-count: 19); }
  .circle.size-20 li { @include on-circle($item-count: 20); }


  // player circle
  .circle {
    background: url('../img/demon-head2.png') center center no-repeat;
    background-size: 10%;
  }

  #townsquare.public .circle {
    background-image: url('../img/demon-head.png');
  }
</style>
