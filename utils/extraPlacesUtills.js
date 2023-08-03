function calculateExtraPlaces(
  agesAfterAccomodation,
  extraPlacesArray,
  chosenRoom,
  addExtraFood,
  daysAmount
) {
  let chosenPlaces = [];
  let extraPlacesSum = 0;

  const notChosen = (place) => {
    // console.log(place, "place");
    return (
      chosenPlaces.filter((el) => el._id === place._id).length < place.maxAmount
    );
  };

  agesAfterAccomodation.forEach((age) => {
    const matchingPlace = extraPlacesArray.find((place) => {
      if (age <= place.maxAge && age >= place.minAge && notChosen(place)) {
        return true;
      }
    });
    if (matchingPlace) {
      chosenPlaces.push(matchingPlace);
    }
  });

  // console.log(chosenPlaces, "chosenPlaces");

  extraPlacesSum = chosenPlaces.reduce((acc, place) => {
    if (addExtraFood !== "false" && !chosenRoom.extraFoodIncluded) {
      return acc + (place.priceNoFood + place.foodPrice) * daysAmount;
    } else if (addExtraFood !== "true" && !chosenRoom.extraFoodIncluded) {
      return acc + place.priceNoFood * daysAmount;
    } else if (chosenRoom.extraFoodIncluded) {
      return acc + place.priceWithFood * daysAmount;
    }
  }, 0);

  return extraPlacesSum > 0 ? extraPlacesSum : 0;
}

const checkExtraPlaces = (
  agesAfterAccomodation,
  extraPlacesArray,
  totalExtraPlacesAmount
) => {
  let chosenPlaces = [];

  const notChosen = (place) => {
    return (
      chosenPlaces.filter((el) => el._id === place._id).length < place.maxAmount
    );
  };

  agesAfterAccomodation.forEach((age) => {
    const matchingPlace = extraPlacesArray.find((place) => {
      if (age <= place.maxAge && age >= place.minAge && notChosen(place)) {
        return true;
      }
    });
    if (matchingPlace) {
      chosenPlaces.push(matchingPlace);
    }
  });

  return chosenPlaces.length >= agesAfterAccomodation.length &&
    chosenPlaces.length <= totalExtraPlacesAmount
    ? true
    : false;
};

module.exports = { calculateExtraPlaces, checkExtraPlaces };
