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
      currentTime: moment().format('LT'),
      interval: null,
      currentDate: moment().format('l'),
      currentHours: moment().hours(),
      currentMinutes: moment().minutes(),
      start: {
        input: '',
        value: '--:--',
        inputEnabled: true
      },
      plannedHours: {
        input: '',
        value: '--:--',
        inputEnabled: true
      },
      end: {
        input: '',
        value: '--:--',
        inputEnabled: true
      },
      realHoursValue: '--:--',
      diffHoursValue: '--:--',
      statusValue: '-',
      heroText: 'Your greatest resource<br /> is your time.',
      fullDateFormat: fullDateFormat
    };
  },
  methods: {
    loadTime: function () {
      var now = moment().format('LT');
      var today = moment().format('l');
      if (this.currentTime !== now) {
        this.currentTime = now;
        this.currentHours = moment().hours();
        this.currentMinutes = moment().minutes();
      }
      if (this.currentDate !== today) {
        this.currentDate = today;
      }
    },
    calculateTime: function () {

      var startMoment = this.toDateTimeMoment(this.start.input);
      var hoursDuration = this.toHoursDuration(this.plannedHours.input);
      var endMoment = this.toDateTimeMoment(this.end.input);

      if (startMoment.isValid() && hoursDuration.isValid()) {

        this.start.value = this.formatMoment(startMoment);
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(startMoment.add(hoursDuration));
        this.end.inputEnabled = false;

      } else if (startMoment.isValid() && endMoment.isValid()) {

        this.start.value = this.formatMoment(startMoment);
        this.plannedHours.value = moment.duration(endMoment.diff(startMoment)).format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(endMoment);
        this.plannedHours.inputEnabled = false;

      } else if (startMoment.isValid()) {

        this.start.value = this.formatMoment(startMoment);
        this.plannedHours.value = '--:--';
        this.end.value = '--:--';

        this.end.inputEnabled = true;
        this.plannedHours.inputEnabled = true;

      } else if (hoursDuration.isValid() && endMoment.isValid()) {

        this.start.value = this.formatMoment(endMoment.subtract(hoursDuration));
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatMoment(endMoment);
        this.start.inputEnabled = false;

      } else {

        this.start.value = '--:--';
        this.plannedHours.value = '--:--';
        this.end.value = '--:--';

        this.start.inputEnabled = true;
        this.plannedHours.inputEnabled = true;
        this.end.inputEnabled = true;

      }

      this.adjustStats();

    },
    adjustTime() {

      var startMoment = this.toDateTimeMoment(this.start.input);
      var hoursDuration = this.toHoursDuration(this.plannedHours.input);
      var endMoment = this.toDateTimeMoment(this.end.input);

      
      if (startMoment.isValid()) {
        this.start.input = this.formatMoment(startMoment);
      }
      if (hoursDuration.isValid()) {
        this.plannedHours.input = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
      }
      if (endMoment.isValid()) {
        this.end.input = this.formatMoment(endMoment);
      }

    },
    toDateTimeMoment(stringValue) {
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
    toHoursDuration(value) {
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

      var startMoment = this.toDateTimeMoment(this.start.value);
      var hoursDuration = this.toHoursDuration(this.plannedHours.value);
      var endInputMoment = this.toDateTimeMoment(this.end.input);

      if (startMoment.isValid() && startMoment.isBefore(moment())) {

        var tillFixedEndOrNowDuration = moment.duration(moment().diff(startMoment));
        if (endInputMoment.isValid() && moment().isAfter(endInputMoment)) {
          tillFixedEndOrNowDuration = moment.duration(endInputMoment.diff(startMoment));
        }

        this.realHoursValue = tillFixedEndOrNowDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });

        if (hoursDuration.isValid()) {
          var diffHoursDuration = tillFixedEndOrNowDuration.clone().subtract(hoursDuration);
          this.diffHoursValue = diffHoursDuration.format(moment.HTML5_FMT.TIME, {
            trim: false
          });

          var tillNowHoursFloat = parseFloat(tillFixedEndOrNowDuration.format('h', 2));
          var hoursFloat = parseFloat(hoursDuration.format('h', 2));

          var percentage = tillNowHoursFloat * (100 / hoursFloat);
          percentage = (percentage === Infinity) ? 0 : percentage;

          this.statusValue = percentage.toFixed(2) + ' % : ' + tillNowHoursFloat.toFixed(2) + ' of ' + hoursFloat.toFixed(2) + '';

          if (endInputMoment.isValid() && moment().isAfter(endInputMoment) && tillNowHoursFloat === hoursFloat) {
            this.heroText = 'just in time';
          } else if (tillFixedEndOrNowDuration.asMinutes() <= hoursDuration.asMinutes()) {
            this.heroText = 'time to stop in<br/>' + moment.duration(diffHoursDuration.asMinutes() * -1, 'minutes').format('h [hours], m [minutes]');
          } else {
            this.heroText = 'time exceeded by<br/>' + diffHoursDuration.format('h [hours], m [minutes]');
          }

        } else {
          this.statusValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.'
        }

      } else {

        this.realHoursValue = '--:--';
        this.diffHoursValue = '--:--';

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
      var originalTime = this.currentTime;
      this.loadTime();
      if (originalTime !== this.currentTime) {
        this.adjustStats();
      }
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})