Vue.component('header-time', {
  template: '<span class="header-time">{{time}}</span>',
  props: ['time']
});

Vue.component('header-date', {
  template: '<span class="header-date">{{date}}</span>',
  props: ['date']
});

Vue.component('header-clock', {
  template: [
    '<div class="small-clock">',
    ' <div class="minutes" :style="{ transform : toMinutesRotation(minutes)}"></div>',
    ' <div class="hours" :style="{ transform : toHoursRotation(hours, minutes)}"></div>',
    '</div>'
  ].join('\n'),
  props: ['hours', 'minutes'],
  methods: {
    toHoursRotation: function(hours, minutes) {
      let deg = 30 * ((hours % 12) + minutes / 60); // 30 degrees hour
      return 'rotate('+ deg + 'deg)';
    },
    toMinutesRotation: function(minutes) {
      let deg = 6 * minutes; // 6 degrees every minute
      return 'rotate('+ deg + 'deg)';
    }
  }
});

new Vue({
  el: '#app',
  data: {
    time: moment().format('LT'),
    interval: null,
    date: moment().format('l'),
    hours: moment().hours(),
    minutes: moment().minutes()
  },
  methods: {
    loadTime: function () {
      let now = moment().format('LT');
      let today = moment().format('l');
      if(this.time !== now) {
        this.time = now;
        this.hours = moment().hours();
        this.minutes = moment().minutes();
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