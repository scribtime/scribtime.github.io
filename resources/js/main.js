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

function getLang() {
  return navigator.language || navigator.browserLanguage || (navigator.languages || [ "en" ])[0];
} 

new Vue({
  el: '#app',
  data: function () {
    var fullDateFormat = moment.localeData().longDateFormat('L') + ' ' + moment.HTML5_FMT.TIME;
    return {
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
        inputEnabled: true
      },
      realDurationValue: '--:--',
      diffDurationValue: '--:--',
      statusValue: '-',
      heroText: 'Your greatest resource<br /> is your time.',
      fullDateFormat: fullDateFormat
    };
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

        this.start.value = this.formatMoment(startMoment);
        this.duration.value = durationDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(startMoment.add(durationDuration));
        this.end.inputEnabled = false;

      } else if (startMoment.isValid() && endMoment.isValid()) {

        this.start.value = this.formatMoment(startMoment);
        this.duration.value = moment.duration(endMoment.diff(startMoment)).format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(endMoment);
        this.duration.inputEnabled = false;

      } else if (startMoment.isValid()) {

        this.start.value = this.formatMoment(startMoment);
        this.duration.value = '--:--';
        this.end.value = '--:--';

        this.end.inputEnabled = true;
        this.duration.inputEnabled = true;

      } else if (durationDuration.isValid() && endMoment.isValid()) {

        this.start.value = this.formatMoment(endMoment.subtract(durationDuration));
        this.duration.value = durationDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(endMoment);
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
    adjustTime() {

      var startMoment = this.toMoment(this.start.input);
      var durationDuration = this.toDuration(this.duration.input);
      var endMoment = this.toMoment(this.end.input);

      
      if (startMoment.isValid()) {
        this.start.input = this.formatMoment(startMoment);
      }
      if (durationDuration.isValid()) {
        this.duration.input = durationDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
      }
      if (endMoment.isValid()) {
        this.end.input = this.formatMoment(endMoment);
      }

    },
    toMoment(stringValue) {
      if (_.trim(stringValue) === '') {
        return moment.invalid();
      }
      var fullDate = moment(stringValue, this.fullDateFormat, true);
      if (fullDate.isValid()) {
        return fullDate;
      }
      return moment(stringValue, moment.HTML5_FMT.TIME);
    },
    formatMoment(momentValue) {
      if(momentValue.isSame(moment(), 'day')) {
        return momentValue.format(moment.HTML5_FMT.TIME);
      }
      return momentValue.format(this.fullDateFormat);
    },
    toDuration(value) {
      if (_.trim(value) === '' || value === '--:--') {
        return moment.duration.invalid();
      } else if (/^\d+$/.test(value)) {
        return moment.duration(value + ':00');
      } else if (/^\d+?\.\d+$/.test(value)) {
        return moment.duration(parseFloat(value), 'hours');
      } else if (/^\d+?:\d+(:\d+)?$/.test(value)) {
        return moment.duration(value);
      }
      return moment.invalid();
    },
    adjustStats: function () {

      var startMoment = this.toMoment(this.start.value);
      var durationDuration = this.toDuration(this.duration.value);
      var endInputMoment = this.toMoment(this.end.input);

      if (startMoment.isValid() && startMoment.isBefore(moment())) {

        var tillFixedEndOrNow = moment.duration(moment().diff(startMoment));
        if (endInputMoment.isValid() && moment().isAfter(endInputMoment)) {
          tillFixedEndOrNow = moment.duration(endInputMoment.diff(startMoment));
        }


        this.realDurationValue = tillFixedEndOrNow.format(moment.HTML5_FMT.TIME, {
          trim: false
        });

        if (durationDuration.isValid()) {
          var diffDuration = tillFixedEndOrNow.clone().subtract(durationDuration);
          this.diffDurationValue = diffDuration.format(moment.HTML5_FMT.TIME, {
            trim: false
          });

          var tillNowHours = parseFloat(tillFixedEndOrNow.format('h', 2));
          var durationHours = parseFloat(durationDuration.format('h', 2));

          var percentage = tillNowHours * (100 / durationHours);
          percentage = (percentage === Infinity) ? 0 : percentage;

          this.statusValue = percentage.toFixed(2) + ' % : ' + tillNowHours.toFixed(2) + ' of ' + durationHours.toFixed(2) + '';

          if (endInputMoment.isValid() && moment().isAfter(endInputMoment) && tillNowHours === durationHours) {
            this.heroText = 'just in time';
          } else if (tillFixedEndOrNow.asMinutes() <= durationDuration.asMinutes()) {
            this.heroText = 'time to stop in<br/>' + moment.duration(diffDuration.asMinutes() * -1, 'minutes').format('h [hours], m [minutes]');
          } else {
            this.heroText = 'time exceeded by<br/>' + diffDuration.format('h [hours], m [minutes]');
          }

        } else {
          this.statusValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.'
        }

      } else {

        this.realDurationValue = '--:--';
        this.diffDurationValue = '--:--';

        if (startMoment.isValid() && startMoment.isAfter(moment())) {
          this.statusValue = 'starts in ' + moment.duration(startMoment.diff(moment())).format('h [hours], m [minutes]');
          this.heroText = 'Your greatest resource<br/> is your time.';
        } else {
          this.statusValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.';
        }

      }
    },
    visibility(show) {
      if (show) {
        return {};
      }
      return { display: 'none' };
    }
  },
  mounted: function () {
    this.loadTime();
    this.interval = setInterval(function () {
      var originalTime = this.time;
      this.loadTime();
      if (originalTime !== this.time) {
        this.adjustStats();
      }
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})