function TimeUtils()  {
  this.fullDateFormat = moment.localeData().longDateFormat('L') + ' ' + moment.HTML5_FMT.TIME;
}

TimeUtils.prototype.toHoursDuration = function(value) {
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
}

TimeUtils.prototype.toDateTimeMoment = function(stringValue) {
  if (_.trim(stringValue) === '') {
    return moment.invalid();
  }
  var fullDate = moment(stringValue, this.fullDateFormat, true);
  if (fullDate.isValid()) {
    return fullDate;
  }
  return moment(stringValue, moment.HTML5_FMT.TIME);
}

TimeUtils.prototype.formatDateTimeMoment = function(momentValue) {
  if(!momentValue.isValid()) {
    return '--:--';
  }
  if(momentValue.isSame(moment(), 'day')) {
    return momentValue.format(moment.HTML5_FMT.TIME);
  }
  return momentValue.format(this.fullDateFormat);
}

TimeUtils.prototype.formatDuration = function(durationValue) {
  if(!durationValue.isValid()) {
    return '--:--';
  }
  return durationValue.format(moment.HTML5_FMT.TIME, {
    trim: false
  });
}

var timeUtils = new TimeUtils();