function daysIntoArray(start, daysNum) {
  const startingDate = new Date(+start);
  startingDate.setUTCHours(0, 0, 0, 0);

  let daysArray = [];

  for (let i = 1; i <= daysNum; i++) {
    const date = new Date(startingDate);
    date.setUTCDate(startingDate.getUTCDate() + i);
    date.setUTCHours(0, 0, 0, 0);
    daysArray.push(date);
  }

  return daysArray;
}

module.exports = { daysIntoArray };
