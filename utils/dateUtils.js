function isDateInRange(date, startMonth, startDay, endMonth, endDay) {
  return (
    ((date.getMonth() + 1 > startMonth ||
      (date.getMonth() + 1 === startMonth && date.getDate() >= startDay)) &&
      (date.getMonth() + 1 < endMonth ||
        (date.getMonth() + 1 === endMonth && date.getDate() <= endDay))) ||
    (startMonth === endMonth &&
      date.getMonth() + 1 === startMonth &&
      date.getDate() >= startDay &&
      date.getDate() <= endDay)
  );
}

module.exports = { isDateInRange };
