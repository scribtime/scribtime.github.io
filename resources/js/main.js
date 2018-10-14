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
    start: {
      input: '',
      value: '--:--',
      inputEnabled: true
    },
    duration: {
      input: '',
      value: '--:--',
      inputEnabled: true
    },
    end: {
      input: '',
      value: '--:--',
      inputEnabled : true
    },
    currentDurationValue: '--:--',
    diffDurationValue: '--:--',
    statusValue: '-',
    heroText: 'Your greatest resource<br /> is your time.'
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

      var startMoment = this.toMoment(this.start.input);
      var durationDuration = this.toDuration(this.duration.input);
      var endMoment = this.toMoment(this.end.input);

      if (startMoment.isValid() && durationDuration.isValid()) {

        this.start.value = startMoment.format(moment.HTML5_FMT.TIME);
        this.duration.value = durationDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = startMoment.add(durationDuration).format(moment.HTML5_FMT.TIME);
        this.end.inputEnabled = false;

      } else if (startMoment.isValid() && endMoment.isValid()) {

        this.start.value = startMoment.format(moment.HTML5_FMT.TIME);
        this.duration.value = moment.duration(endMoment.diff(startMoment)).format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = endMoment.format(moment.HTML5_FMT.TIME);
        this.duration.inputEnabled = false;

      } else if(startMoment.isValid()) {
        
        this.start.value = startMoment.format(moment.HTML5_FMT.TIME);
        this.duration.value = '--:--';
        this.end.value = '--:--';

        this.end.inputEnabled = true;
        this.duration.inputEnabled = true;

      } else if(durationDuration.isValid() && endMoment.isValid()) {

        this.start.value = endMoment.subtract(durationDuration).format(moment.HTML5_FMT.TIME);
        this.duration.value = durationDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = endMoment.format(moment.HTML5_FMT.TIME);
        this.start.inputEnabled = false;

      } else {

        this.start.value = '--:--';
        this.duration.value = '--:--';
        this.end.value = '--:--';

        this.start.inputEnabled = true;
        this.duration.inputEnabled = true;
        this.end.inputEnabled = true;

      }

      this.adjustStats();

    },
    toMoment(value) {
      if(_.trim(value) === '') {
        return moment.invalid();
      }
      return moment(value, moment.HTML5_FMT.TIME);
    },
    toDuration(value) {
      if(_.trim(value) === '' || value === '--:--') {
        return moment.duration.invalid();
      } else if(/^\d+$/.test(value)) {
        return moment.duration(value + ':00');
      } else if (/^\d+?\.\d+$/.test(value)) {
        return moment.duration(parseFloat(value), 'hours');
      }
      return moment.duration(value);
    },
    adjustStats: function () {

      var startMoment = this.toMoment(this.start.value);
      var durationDuration = this.toDuration(this.duration.value);

      if (startMoment.isValid() && startMoment.isBefore(moment())) {

        var tillNowDuration = moment.duration(moment().diff(startMoment));
        this.currentDurationValue = tillNowDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });

        if (durationDuration.isValid()) {
          var diffDuration = tillNowDuration.clone().subtract(durationDuration);
          this.diffDurationValue = diffDuration.format(moment.HTML5_FMT.TIME, {
            trim: false
          });
          
          if(tillNowDuration.asMinutes() <= durationDuration.asMinutes()) {
            this.statusValue = 'stop in ' + moment.duration(diffDuration.asMinutes()*-1, 'minutes').format('h [hours], m [minutes]');
            this.heroText = 'time to stop in<br/>' + moment.duration(diffDuration.asMinutes()*-1, 'minutes').format('h [hours], m [minutes]');
          } else {
            this.statusValue = 'exceeded by ' + diffDuration.format('h [hours], m [minutes]');
            this.heroText = 'time exceeded by<br/>' + diffDuration.format('h [hours], m [minutes]');
          }

        } else {
          this.statusValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.'
        }

      } else {

        this.currentDurationValue = '--:--';
        this.diffDurationValue = '--:--';

        if(startMoment.isValid() && startMoment.isAfter(moment())) {
          this.statusValue = 'starts in ' + moment.duration(startMoment.diff(moment())).format('h [hours], m [minutes]');
          this.heroText = 'Your greatest resource<br/> is your time.';
        } else {
          this.statusValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.';
        }

      }
    },
    visibility(show) {
      if(show) {
        return {};
      }
      return { display: 'none'};
    }
  },
  mounted: function () {
    this.loadTime();
    this.interval = setInterval(function () {
      var originalTime = this.time;
      this.loadTime();
      if(originalTime !== this.time) {
        this.adjustStats();
      }
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})