function comparePeriods(periodA, periodB) {
  // Compare start months
  if (periodA.startMonth !== periodB.startMonth) {
    return periodA.startMonth - periodB.startMonth;
  }

  // If start months are equal, compare start days
  if (periodA.startDay !== periodB.startDay) {
    return periodA.startDay - periodB.startDay;
  }

  // If start days are also equal, compare end months
  if (periodA.endMonth !== periodB.endMonth) {
    return periodA.endMonth - periodB.endMonth;
  }

  // If end months are equal, compare end days
  return periodA.endDay - periodB.endDay;
}

module.exports = { comparePeriods };
