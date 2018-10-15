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
      planValue: '-',
      statusValue: '-',
      progressValue: '-',
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

      if (startMoment.isValid() && endMoment.isValid()) {

        this.start.value = this.formatDateTimeMoment(startMoment);
        this.plannedHours.value = moment.duration(endMoment.diff(startMoment)).format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatDateTimeMoment(endMoment);
        this.plannedHours.inputEnabled = false;

      } else if (startMoment.isValid() && hoursDuration.isValid()) {

        this.start.value = this.formatDateTimeMoment(startMoment);
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatDateTimeMoment(startMoment.add(hoursDuration));
        this.end.inputEnabled = false;

      } else if (hoursDuration.isValid() && endMoment.isValid()) {

        this.start.value = this.formatDateTimeMoment(endMoment.subtract(hoursDuration));
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = this.formatDateTimeMoment(endMoment);
        this.start.inputEnabled = false;

      } else if (startMoment.isValid()) {

        this.start.value = this.formatDateTimeMoment(startMoment);
        this.plannedHours.value = '--:--';
        this.end.value = '--:--';

        this.end.inputEnabled = true;
        this.plannedHours.inputEnabled = true;

      } else {

        this.start.value = '--:--';
        this.plannedHours.value = '--:--';
        this.end.value = '--:--';

        this.start.inputEnabled = true;
        this.plannedHours.inputEnabled = true;
        this.end.inputEnabled = true;

      }

      this.calculateInfosAndHeroText();

    },
    adjustTime: function() {

      var startMoment = this.toDateTimeMoment(this.start.input);
      var hoursDuration = this.toHoursDuration(this.plannedHours.input);
      var endMoment = this.toDateTimeMoment(this.end.input);

      
      if (startMoment.isValid()) {
        this.start.input = this.formatDateTimeMoment(startMoment);
      }
      if (hoursDuration.isValid()) {
        this.plannedHours.input = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
      }
      if (endMoment.isValid()) {
        this.end.input = this.formatDateTimeMoment(endMoment);
      }

    },
    toDateTimeMoment: function(stringValue) {
      if (_.trim(stringValue) === '') {
        return moment.invalid();
      }
      var fullDate = moment(stringValue, this.fullDateFormat, true);
      if (fullDate.isValid()) {
        return fullDate;
      }
      return moment(stringValue, moment.HTML5_FMT.TIME);
    },
    formatDateTimeMoment: function(momentValue) {
      if(!momentValue.isValid()) {
        return '--:--';
      }
      if(momentValue.isSame(moment(), 'day')) {
        return momentValue.format(moment.HTML5_FMT.TIME);
      }
      return momentValue.format(this.fullDateFormat);
    },
    formatDuration: function(durationValue) {
      if(!durationValue.isValid()) {
        return '--:--';
      }
      return durationValue.format(moment.HTML5_FMT.TIME, {
        trim: false
      });
    },
    toHoursDuration: function(value) {
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
    calculateInfosAndHeroText: function () {

      var startMoment = this.toDateTimeMoment(this.start.value);
      
      var hoursDuration = this.toHoursDuration(this.plannedHours.value);
      var hoursInputDuration = this.toHoursDuration(this.plannedHours.input);
      var plannedDuration = hoursInputDuration.isValid() ? hoursInputDuration : hoursDuration;

      var endMoment = this.toDateTimeMoment(this.end.value);
      var endInputMoment = this.toDateTimeMoment(this.end.input);

      if (startMoment.isValid() && startMoment.isBefore(moment())) {

        var tillNowDuration = moment.duration(moment().diff(startMoment));
        var tillFixedEndOrNowDuration = tillNowDuration;
        if (endInputMoment.isValid() && moment().isAfter(endInputMoment)) {
          tillFixedEndOrNowDuration = moment.duration(endInputMoment.diff(startMoment));
        }

        this.planValue = this.formatDuration(hoursDuration) + ' h  [ from ' + this.formatDateTimeMoment(startMoment) + ' to ' + this.formatDateTimeMoment(endMoment) + ' ]';

        if (plannedDuration.isValid()) {

          var diffHoursDuration = tillFixedEndOrNowDuration.clone().subtract(plannedDuration);
          var tillNowHoursFloat = parseFloat(tillFixedEndOrNowDuration.format('h', 2));
          var hoursFloat = parseFloat(plannedDuration.format('h', 2));
          
          var percentage = tillNowHoursFloat * (100 / hoursFloat);
          percentage = (percentage === Infinity) ? 0 : percentage;
          
          this.progressValue = percentage.toFixed(2) + ' % [ ' + tillNowHoursFloat.toFixed(2) + ' h of ' + hoursFloat.toFixed(2) + ' h ]';
          
          var diffHoursText = '';
          if (endInputMoment.isValid() && moment().isAfter(endInputMoment) && tillNowHoursFloat === hoursFloat) {
            this.heroText = 'just in time';
            diffHoursText = ', just in time';
          } else if (tillFixedEndOrNowDuration.asMinutes() <= plannedDuration.asMinutes()) {
            this.heroText = 'time to stop in<br/>' + moment.duration(diffHoursDuration.asMinutes() * -1, 'minutes').format('h [hours], m [minutes]');
            diffHoursText = ', remaining ' + this.formatDuration(moment.duration(diffHoursDuration.asMinutes() * -1, 'minutes')) + ' h'
          } else {
            this.heroText = 'time exceeded by<br/>' + diffHoursDuration.format('h [hours], m [minutes]');
            diffHoursText = ', exceeded by ' + this.formatDuration(diffHoursDuration);
          }

          this.statusValue = this.formatDuration(tillFixedEndOrNowDuration) + ' h [ ' + this.formatDuration(plannedDuration) + ' h ' + diffHoursText + ' ]';

        } else {
          this.progressValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.'
        }

      } else {

        this.planValue = '-';
        this.statusValue = '-';

        if (startMoment.isValid() && startMoment.isAfter(moment())) {
          this.progressValue = 'starts in ' + moment.duration(startMoment.diff(moment())).format('h [hours], m [minutes]');
          this.heroText = 'Your greatest resource<br/> is your time.';
        } else {
          this.progressValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.';
        }

      }
    },
    visibility: function(show) {
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
        this.calculateInfosAndHeroText();
      }
    }.bind(this), 1000);
  },
  beforeDestory: function () {
    clearInterval(this.interval);
  }
})