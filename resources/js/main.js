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
    startInput: '',
    durationInput: '',
    endInput: '',
    startValue: '--:--',
    durationValue: '--:--',
    endValue: '--:--',
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

      var startInputMoment = moment(this.startInput, moment.HTML5_FMT.TIME);
      var durationInputMoment = moment.duration(this.durationInput);

      if (_.trim(this.startInput) !== '' && startInputMoment.isValid() && _.trim(this.durationInput) !== '' && durationInputMoment.isValid()) {

        this.startValue = startInputMoment.format(moment.HTML5_FMT.TIME);
        this.durationValue = durationInputMoment.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.endValue = startInputMoment.add(durationInputMoment).format(moment.HTML5_FMT.TIME);

      } else if (startInputMoment.isValid()) {

        this.startValue = startInputMoment.format(moment.HTML5_FMT.TIME);
        this.durationValue = '--:--';
        this.endValue = '--:--';

      }

    },
    adjustStats: function () {
      var startInputMoment = moment(this.startValue, moment.HTML5_FMT.TIME);
      var durationInputMoment = moment.duration(this.durationValue);

      if (_.trim(this.startInput) !== '' && startInputMoment.isValid()) {

        var tillNowDuration = moment.duration(moment().diff(startInputMoment));
        this.currentDuration = tillNowDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });

        if (_.trim(this.durationInput) !== '' && durationInputMoment.isValid()) {
          this.diffDuration = tillNowDuration.subtract(durationInputMoment).format(moment.HTML5_FMT.TIME, {
            trim: false
          });
        }

      } else {
        this.currentDuration = '--:--';
        this.diffDuration = '--:--';
        this.status = '-';
      }
    },
    addjustFieldVisibilty: function(field) {

      if(_.startsWith(field, 'end')) {
        if(_.trim(this.startInput) !== '' && _.trim(this.durationInput) !== '') {
          if(_.endsWith(field, 'Input')) {
            return { display: 'none'};
          } else {
            return {};
          }
        }
      }

      if(_.endsWith(field, 'Value')) {
        return { display: 'none'};
      }
      return {};
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