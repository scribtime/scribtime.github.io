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
    toHoursRotation: function (hours, minutes) {
      var deg = 30 * ((hours % 12) + minutes / 60); // 30 degrees hour
      return 'rotate(' + deg + 'deg)';
    },
    toMinutesRotation: function (minutes) {
      var deg = 6 * minutes; // 6 degrees every minute
      return 'rotate(' + deg + 'deg)';
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
    minutes: moment().minutes(),
    startEntry: '',
    durationEntry: '',
    endEntry: '',
    startPlan: '--:--',
    durationPlan: '--:--',
    endPlan: '--:--',
    currentDuration: '--:--',
    diffDuration: '--:--',
    status: '-'
  },
  methods: {
    loadTime: function () {
      var now = moment().format('LT');
      var today = moment().format('l');
      if (this.time !== now) {
        this.time = now;
        this.hours = moment().hours();
        this.minutes = moment().minutes();
      }
      if (this.date !== today) {
        this.date = today;
      }
    },
    calculateTime: function () {

      var startEntryMoment = moment(this.startEntry, moment.HTML5_FMT.TIME);
      var durationEntryMoment = moment.duration(this.durationEntry);

      if (_.trim(this.startEntry) !== '' && startEntryMoment.isValid() && _.trim(this.durationEntry) !== '' && durationEntryMoment.isValid()) {
        this.startPlan = startEntryMoment.format(moment.HTML5_FMT.TIME);
        this.durationPlan = durationEntryMoment.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.endPlan = startEntryMoment.add(durationEntryMoment).format(moment.HTML5_FMT.TIME);
      } else if (startEntryMoment.isValid()) {
        this.startPlan = startEntryMoment.format(moment.HTML5_FMT.TIME);
        this.durationPlan = '--:--';
        this.endPlan = '--:--';
      }

    },
    adjustStats: function () {
      var startEntryMoment = moment(this.startPlan, moment.HTML5_FMT.TIME);
      var durationEntryMoment = moment.duration(this.durationPlan);

      if (_.trim(this.startEntry) !== '' && startEntryMoment.isValid()) {

        var tillNowDuration = moment.duration(moment().diff(startEntryMoment));
        this.currentDuration = tillNowDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });

        if (_.trim(this.durationEntry) !== '' && durationEntryMoment.isValid()) {
          this.diffDuration = tillNowDuration.subtract(durationEntryMoment).format(moment.HTML5_FMT.TIME, {
            trim: false
          });
        }

      } else {
        this.currentDuration = '--:--';
        this.diffDuration = '--:--';
        this.status = '-';
      }
    }
  },
  mounted: function () {
    this.loadTime();
    this.interval = setInterval(function () {
      this.loadTime();
      this.adjustStats();
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})