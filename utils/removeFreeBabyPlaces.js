const removeAges = (agesArray, babyExtraPlacesAmount, babyMaxAge) => {
  if (babyExtraPlacesAmount <= 0) {
    return agesArray; // No removal needed
  }

  // Create a copy of the ages array to avoid modifying the original array
  const sortedAges = [...agesArray].sort((a, b) => a - b);

  // Remove the youngest ages based on the babyExtraPlacesAmount
  let updatedAgesArray = sortedAges;

  function updateAgesArray(ages, babyMaxAge, babyExtraPlacesAmount) {
    const updatedAges = [];
    let removedCount = 0;

    for (let i = 0; i < ages.length; i++) {
      const age = ages[i];

      if (age < babyMaxAge && removedCount < babyExtraPlacesAmount) {
        removedCount++;
      } else {
        updatedAges.push(age);
      }
    }

    return updatedAges;
  }

  updatedAgesArray = updateAgesArray(
    updatedAgesArray,
    babyMaxAge,
    babyExtraPlacesAmount
  );

  return updatedAgesArray;
};

module.exports = { removeAges };
