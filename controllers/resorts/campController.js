const Camp = require("../../models/resorts/campModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isDateInRange } = require("../../utils/dateUtils");
const Period = require("../../models/periodModel");
const mongoose = require("mongoose");
const { daysIntoArray } = require("../../utils/daysUtils");

//@desc   Get all camps
//@route  GET /api/camp
//@access Public

const getCamps = (req, res) => {
  const { locationId } = req.query;
  const query = {};

  if (locationId && locationId != "") {
    query.locationId = locationId;
  }

  Camp.find(query)
    // .populate("food.foodId")
    .populate("locationId")
    // .populate("comforts")
    .then((response) => res.status(200).json(response))
    .catch(() => res.sendStatus(403));
};

//@desc   Add new camp
//@route  POST /api/camp/
//@access Private

const addCamp = (req, res) => {
  Camp.create(req.body)
    .then((response) => res.status(201).json(response))
    .catch(() => res.sendStatus(403));
};

//@desc   Get single camp
//@route  GET /api/camps/:id
//@access Public

const getSingleCamp = (req, res) => {
  const id = req.params.id;

  Camp.findById(id)
    .populate("locationId")
    .populate("periods")
    .populate({
      path: "agePrices",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .then((response) => res.status(200).json(response))
    .catch((er) => res.status(403).json(er));
};

const deleteCamp = (req, res) => {
  const id = req.params.id;
  Camp.deleteOne({ _id: id })
    .then(() => res.status(200).send("Successfully deleted"))
    .catch(() => res.sendStatus(403));
};

const updateCamp = (req, res) => {
  const id = req.params.id;

  Camp.updateOne(
    { _id: id },
    {
      $set: req.body,
    }
  )
    .then((response) => res.status(201).json(response))
    .catch(() => res.sendStatus(405));
};

const getCampByTags = async (req, res) => {
  const { location } = req.query;
  const query = {};
  if (location) {
    query.location = location;
  }
  try {
    const camps = await Camp.find(query).limit(4);
    if (camps.length === 0) {
      res.sendStatus(404);
    } else {
      res.status(200).json(camps);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

//@desc   Add new age to camp
//@route  PATCH /api/camps/age/:campId
//@access Private

const addAge1 = asyncHandler(async (req, res) => {
  const { campId } = req.params;

  let camp = await Camp.findById(campId);

  camp.ages.push(req.body);
  camp.agePrices.push({
    minAge: req.body.minAge,
    maxAge: req.body.maxAge,
    periodPrices: camp.periods.map((period) => ({
      period: period,
      campPrice: 0,
    })),
  });

  camp = await camp.save();

  res.status(200).json(camp);
});

const addAge = asyncHandler(async (req, res) => {
  const { campId } = req.params;
  const ages = req.body;

  let camp = await Camp.findById(campId);

  if (ages) {
    const newAges = await Promise.all(
      ages.map(async (age) => {
        if (!age._id) {
          camp.ages.push(age);
          camp.agePrices.push({
            minAge: age.minAge,
            maxAge: age.maxAge,
            periodPrices: camp.periods.map((period) => ({
              period: period,
              campPrice: 0,
            })),
          });
          return age;
        }
      })
    );
  }

  camp = await camp.save();

  res.status(200).json(camp);
});

//@desc   Add new age to camp
//@route  DELETE /api/camps/age/:campId
//@access Private

const deleteAge = asyncHandler(async (req, res) => {
  const { campId, ageId } = req.params;

  let camp = await Camp.findById(campId);

  const foundAge = camp.ages.find((age) => age._id.toString() === ageId);
  // console.log(foundAge, "found Age");
  const agePriceId = camp.agePrices.find(
    (age) => age.minAge === foundAge.minAge && age.maxAge === foundAge.maxAge
  )._id;

  console.log(agePriceId, "agePriceId");

  camp.ages = camp.ages.filter((age) => age._id.toString() !== ageId);

  camp.agePrices = camp.agePrices.filter(
    (agePrice) => agePrice._id !== agePriceId
  );

  camp = await camp.save();

  res.status(200).json(camp.ages);
});

//@desc   Update individual agePrice
//@route  PATCH /api/camps/ageprice/:campId
//@access Private

const updateAgePriceById = asyncHandler(async (req, res) => {
  const { campId } = req.params;
  const { periodPrices } = req.body;
  const agePriceId = new mongoose.Types.ObjectId(req.body.agePriceId);
  const newCampId = new mongoose.Types.ObjectId(campId);

  // const newageprice = await Camp.findOne({
  //   _id: newCampId,
  //   "agePrices._id": agePriceId,
  // });

  // console.log(newageprice, "newageprice");

  const agePrice = await Camp.findOneAndUpdate(
    { _id: newCampId, "agePrices._id": agePriceId },
    { $set: { "agePrices.$.periodPrices": periodPrices } },
    { new: true }
  );

  if (!agePrice) {
    return res.status(404).json({ error: "Age price not found" });
  }

  res.status(200).json(agePrice);
});

//@desc   Get camp price
//@route  GET /api/camps/price
//@access Public

const getPrice = asyncHandler(async (req, res) => {
  const { campId, agesArray, start, daysAmount } = req.query;

  let ages = agesArray.split(",").map(Number);
  console.log(ages, "ages");

  const camp = await Camp.findById(campId)
    .populate("periods")
    .populate({
      path: "agePrices",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    });

  // res.status(200).json(camp);

  const agePrices = camp.agePrices;
  let sum = 0;

  let allAgesMatched = true;

  for (const age of ages) {
    if (!camp.ages.some((el) => age >= el.minAge && age <= el.maxAge)) {
      allAgesMatched = false;
      break;
    }
  }

  if (!allAgesMatched) {
    return res
      .status(404)
      .json({ error: "Не все возраста подходят этому лагерю" });
  }

  (function calculatePrice(basePrice) {
    let daysArray = daysIntoArray(start, daysAmount);

    const findPriceByDate = (date) => {
      if (agePrices && agePrices.length > 0) {
        let priceFound = false;

        agePrices.forEach((el) => {
          let allAgesMatchedcInside = true;

          ages.forEach((age) => {
            if (age >= el.minAge && age <= el.maxAge) {
              const pricesArray = el.periodPrices;

              pricesArray.forEach((p) => {
                // console.log(p, "p in periodPrices");

                const startDay = p.period.startDay;
                const startMonth = p.period.startMonth;
                const endDay = p.period.endDay;
                const endMonth = p.period.endMonth;

                console.log(
                  startDay,
                  "/",
                  startMonth,
                  endDay,
                  "/",
                  endMonth,
                  "period date"
                );

                if (
                  isDateInRange(date, startMonth, startDay, endMonth, endDay)
                ) {
                  sum += p.campPrice;
                  ageMatchedToPrice = true;
                }
              });
            }
          });

          priceFound = true;

          if (!allAgesMatchedcInside) {
            return res
              .status(404)
              .json({ error: "Не все возрасты подходят этому лагерю" });
          }
        });
        if (!priceFound) {
          return res
            .status(404)
            .json({ error: "Не все даты подходят этому лагерю" });
        }
      } else {
        return res
          .status(404)
          .json({ error: "У этого лагеря не установлены цены" });
      }
    };

    for (let i = 0; i < daysAmount; i++) {
      findPriceByDate(daysArray[i]);
    }
  })(1);

  const margePercent = (hotel.marge + 100) / 100;

  return sum > 0
    ? res.status(200).json({
        sum: margePercent ? Math.round(sum * margePercent) : sum,
        livingSum: margePercent ? Math.round(sum * margePercent) : sum,
        margeSum: (sum * hotel.marge) / 100,
        kidsAmount: ages.filter((age) => age !== 1000).length,
      })
    : res.status(404).json({ error: "Не удалось посчитать" });
});

//@desc   Get searched camps
//@route  GET /api/camps/searched
//@access Public

const getSearchedCamps = asyncHandler(async (req, res) => {
  const {
    agesArray,
    daysAmount,
    start,
    locationId,
    dashMode,
    searchNameId,
    filterRating,
    minPrice,
    maxPrice,
  } = req.query;

  ages = agesArray.split(",").map(Number);
  const peopleAmount = agesArray.split(",").map(Number).length;
  const kidsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age !== 1000).length;
  const adultsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age === 1000).length;

  const calculatePrice = (start, daysNum, pricesArray) => {
    let daysArray = daysIntoArray(start, daysNum);

    let sum = 0;

    const findPriceByDate = (date) => {
      if (pricesArray && pricesArray.length > 0) {
        let priceFound = false;
        pricesArray.forEach((el) => {
          const startMonth = el.period.startMonth;
          const startDay = el.period.startDay;
          const endMonth = el.period.endMonth;
          const endDay = el.period.endDay;

          let allAgesMatched = true;

          if (isDateInRange(date, startMonth, startDay, endMonth, endDay)) {
            ages.forEach((age) => {
              let ageMatchedToPrice = false; // Flag to track if the age matches with any price
              el.prices.forEach((price) => {
                if (age >= price.minAge && age <= price.maxAge) {
                  sum += price.campPrice;
                  ageMatchedToPrice = true; // Set the flag to true if the age matches with any price
                }
              });
              if (!ageMatchedToPrice) {
                console.log(`Age ${age} doesn't fit`);
                allAgesMatched = false; // Set the flag to false if any age doesn't match any price
              }
            });

            priceFound = true;
          }
          if (!allAgesMatched) {
            console.log("Not all ages fit this camp");
          }
        });
        if (!priceFound) {
          console.log("Could not find periods for these dates");
        }
      } else {
        console.log("This camp has no prices set");
      }
    };

    for (let i = 0; i < daysNum; i++) {
      findPriceByDate(daysArray[i]);
    }

    if (sum === 0) {
      return null; // Return null if price is not found
    }

    return sum;
  };

  const query = {};

  if (locationId && locationId !== "") {
    query.locationId = locationId;
  }
  if (filterRating && filterRating !== undefined) {
    query.rating = {
      $in: filterRating.split(","),
    };
  }

  if (searchNameId && searchNameId !== "") {
    query = {
      ...query,
      $or: [
        { uid: searchNameId }, // Match by ID
        { name: { $regex: searchNameId, $options: "i" } }, // Match by name
      ],
    };
  }

  let adminCamps;
  if (dashMode && dashMode !== "false") {
    adminCamps = await Camp.find(query)
      .populate({
        path: "agePrices",
        populate: {
          path: "periodPrices.period",
          model: "Period",
        },
      })
      .populate("locationId");
    return res.status(200).json(adminCamps);
  }

  let camps = await Camp.find(query)
    .populate({
      path: "agePrices",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate("locationId");

  const newCamps = camps.reduce((result, camp) => {
    const newCamp = camp.toObject();
    const pricesArray = camp.periodPrices;

    const costOfStay = calculatePrice(start, daysAmount, pricesArray);

    if (pricesArray && costOfStay !== null) {
      newCamp.totalPrice = costOfStay;
      result.push({
        ...newCamp,
        totalPrice: costOfStay,
        daysAmount: +daysAmount,
        nightsAmount: daysAmount - 1,
        adultsAmount: +adultsAmount,
        kidsAmount: +kidsAmount,
      });
    }

    return result;
  }, []);

  res
    .status(200)
    .send(
      minPrice && maxPrice
        ? newCamps.filter(
            (hotel) =>
              hotel.totalPrice <= maxPrice &&
              hotel.totalPrice >= minPrice &&
              hotel.totalPrice &&
              hotel.totalPrice !== null
          )
        : newCamps.filter(
            (hotel) => hotel.totalPrice && hotel.totalPrice !== null
          )
    );
});

module.exports = {
  addCamp,
  deleteCamp,
  getSingleCamp,
  getCamps,
  updateCamp,
  getCampByTags,
  getPrice,
  getSearchedCamps,
  updateAgePriceById,
  addAge,
  deleteAge,
};
