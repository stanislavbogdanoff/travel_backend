const { checkExtraPlaces } = require("./extraPlacesUtills");
const { removeAges } = require("./removeFreeBabyPlaces");

const checkCapacity = (
  ages,
  extraPlaces,
  babyMaxAge,
  freeBabyPlaces,
  totalExtraPlacesAmount,
  capacity
) => {
  ages = removeAges(ages, freeBabyPlaces, babyMaxAge);
  ages.sort((a, b) => b - a);
  ages.splice(0, capacity);
  return checkExtraPlaces(ages, extraPlaces, totalExtraPlacesAmount);
};

module.exports = { checkCapacity };
