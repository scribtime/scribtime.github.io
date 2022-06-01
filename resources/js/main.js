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
      breakHours: {
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
      progressBarLeft: this.toProgressBarStyle(0),
      progressBarRight: this.toProgressBarStyle(100)
    };
  },
  methods: {
    toProgressBarStyle(percent) {
      if(percent===100) {
        return {
          width: '100%',
          'border-radius': '5px',
          'border-width': '1px'
        };
      } else if(percent===0) {
        return {
          width: '0%',
          display: 'none'
        };       
      }

      return {
        width: percent + '%'
      }
    },
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

      var startMoment = timeUtils.toDateTimeMoment(this.start.input);
      var hoursDuration = timeUtils.toHoursDuration(this.plannedHours.input);
      var breakDuration = timeUtils.toHoursDuration(this.breakHours.input);
      if(!breakDuration.isValid()) {
        breakDuration = timeUtils.toHoursDuration('00:00');
      }
      var endMoment = timeUtils.toDateTimeMoment(this.end.input);

      if (startMoment.isValid() && endMoment.isValid()) {

        this.start.value = timeUtils.formatDateTimeMoment(startMoment);
        this.plannedHours.value = moment.duration(endMoment.diff(startMoment)).subtract(breakDuration).format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = timeUtils.formatDateTimeMoment(endMoment);
        this.plannedHours.inputEnabled = false;

      } else if (startMoment.isValid() && hoursDuration.isValid()) {

        this.start.value = timeUtils.formatDateTimeMoment(startMoment);
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = timeUtils.formatDateTimeMoment(startMoment.add(hoursDuration).add(breakDuration));
        this.end.inputEnabled = false;

      } else if (hoursDuration.isValid() && endMoment.isValid()) {

        this.start.value = timeUtils.formatDateTimeMoment(endMoment.subtract(hoursDuration).subtract(breakDuration));
        this.plannedHours.value = hoursDuration.format(moment.HTML5_FMT.TIME, {
          trim: false
        });
        this.end.value = timeUtils.formatDateTimeMoment(endMoment);
        this.start.inputEnabled = false;

      } else if (startMoment.isValid()) {

        this.start.value = timeUtils.formatDateTimeMoment(startMoment);
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

      var startMoment = timeUtils.toDateTimeMoment(this.start.input);
      var hoursDuration = timeUtils.toHoursDuration(this.plannedHours.input);
      var breakDuration = timeUtils.toHoursDuration(this.breakHours.input);
      var endMoment = timeUtils.toDateTimeMoment(this.end.input);

      
      if (startMoment.isValid()) {
        this.start.input = timeUtils.formatDateTimeMoment(startMoment);
      }
      if (hoursDuration.isValid()) {
        this.plannedHours.input = timeUtils.formatDuration(hoursDuration);
      }
      if (breakDuration.isValid()) {
        this.breakHours.input = timeUtils.formatDuration(breakDuration);
      }
      if (endMoment.isValid()) {
        this.end.input = timeUtils.formatDateTimeMoment(endMoment);
      }

    },
    calculateInfosAndHeroText: function () {

      var startMoment = timeUtils.toDateTimeMoment(this.start.value);
      
      var hoursDuration = timeUtils.toHoursDuration(this.plannedHours.value);
      var hoursInputDuration = timeUtils.toHoursDuration(this.plannedHours.input);
      var plannedDuration = hoursInputDuration.isValid() ? hoursInputDuration : hoursDuration;
      var breakDuration = timeUtils.toHoursDuration(this.breakHours.input);
      if(!breakDuration.isValid()) {
        breakDuration = timeUtils.toHoursDuration('00:00');
      }

      var endMoment = timeUtils.toDateTimeMoment(this.end.value);
      var endInputMoment = timeUtils.toDateTimeMoment(this.end.input);

      if (startMoment.isValid() && startMoment.isBefore(moment())) {

        var tillNowDuration = moment.duration(moment().diff(startMoment));
        var tillFixedEndOrNowDuration = tillNowDuration;
        if (endInputMoment.isValid() && moment().isAfter(endInputMoment)) {
          tillFixedEndOrNowDuration = moment.duration(endInputMoment.diff(startMoment));
        }

        this.planValue = timeUtils.formatDuration(hoursDuration.clone().add(breakDuration)) + ' h  [ from ' + timeUtils.formatDateTimeMoment(startMoment) + ' to ' + timeUtils.formatDateTimeMoment(endMoment) + ' ]';

        if (plannedDuration.isValid()) {

          var diffHoursDuration = tillFixedEndOrNowDuration.clone().subtract(plannedDuration.clone().add(breakDuration));
          var tillNowHoursFloat = parseFloat(tillFixedEndOrNowDuration.format('h', 2));
          var plannedHoursFloat = plannedDuration.format('h', 2)
          var breakHoursFloat = parseFloat(breakDuration.format('h', 2)
          var hoursFloat = parseFloat(plannedHoursFloat + breakHoursFloat);
          
          var percentage = tillNowHoursFloat * (100 / hoursFloat);
          percentage = (percentage === Infinity) ? 0 : percentage;

          var progressBarPercentage = Math.floor(percentage);
          if(progressBarPercentage > 100) {
            progressBarPercentage = 100;
          }

          this.progressBarLeft = this.toProgressBarStyle(progressBarPercentage);
          this.progressBarRight = this.toProgressBarStyle(100 - progressBarPercentage);
          
          this.progressValue = percentage.toFixed(2) + ' % [ ' + tillNowHoursFloat.toFixed(2) + ' h of ' + hoursFloat.toFixed(2) + ' h - ' + breakHoursFloat.toFixed(2) + ' = ' + plannedHoursFloat.toFixed(2) + ' h ]';
          
          var diffHoursText = '';
          if (endInputMoment.isValid() && moment().isAfter(endInputMoment) && tillNowHoursFloat === hoursFloat) {
            this.heroText = 'just in time';
            diffHoursText = ', just in time';
          } else if (tillFixedEndOrNowDuration.asMinutes() <= plannedDuration.clone().add(breakDuration).asMinutes()) {
            this.heroText = 'time to stop in<br/>' + moment.duration(diffHoursDuration.asMinutes() * -1, 'minutes').format('h [hours], m [minutes]');
            diffHoursText = ', remaining ' + timeUtils.formatDuration(moment.duration(diffHoursDuration.asMinutes() * -1, 'minutes')) + ' h'
          } else {
            this.heroText = 'time exceeded by<br/>' + diffHoursDuration.format('h [hours], m [minutes]');
            diffHoursText = ', exceeded by ' + timeUtils.formatDuration(diffHoursDuration);
          }

          this.statusValue = timeUtils.formatDuration(tillFixedEndOrNowDuration) + ' h [ ' + timeUtils.formatDuration(plannedDuration.clone().add(breakDuration)) + ' h ' + diffHoursText + ' ]';

        } else {
          this.progressValue = '-';
          this.heroText = 'Your greatest resource<br/> is your time.'
          this.progressBarLeft = this.toProgressBarStyle(0);
          this.progressBarRight = this.toProgressBarStyle(100);
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
