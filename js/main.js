const app = new Vue({
  el: '#townsquare',
  data: {
    isPublic: false
  },
  methods: {
    togglePublic: function () {
      console.log('click', this.isPublic);
      this.isPublic = !this.isPublic;
    }
  }
});
