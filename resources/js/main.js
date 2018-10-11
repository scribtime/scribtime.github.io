Vue.component('header-clock', {
  template: '<span class="header-clock">{{time}}</span>',
  props: ['time']
});

Vue.component('header-date', {
  template: '<span class="header-date">{{date}}</span>',
  props: ['date']
});

new Vue({
  el: '#app',
  data: {
    time: moment().format('LT'),
    interval: null,
    date: moment().format('l')
  },
  methods: {
    loadTime: function () {
      let now = moment().format('LT');
      let today = moment().format('l');
      if(this.time !== now) {
        this.time = now;
      }
      if(this.date !== today) {
        this.date = today;
      }
    }
  },
  mounted: function () {
    this.loadTime();
    this.interval = setInterval(function () {
      this.loadTime();
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})