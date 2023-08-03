const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const { Hotel } = require("../../models/resorts/hotelModel");
const Period = require("../../models/periodModel");
const Excursion = require("../../models/excursionModel");
const Room = require("../../models/roomModel");
const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const Tour = require("../../models/resorts/tourModel");
const queryString = require("querystring");
const mongoose = require("mongoose");
const { isDateInRange } = require("../../utils/dateUtils");
const { daysIntoArray } = require("../../utils/daysUtils");
const {
  calculateExtraPlaces,
  checkExtraPlaces,
} = require("../../utils/extraPlacesUtills");
const { removeAges } = require("../../utils/removeFreeBabyPlaces");
const { checkCapacity } = require("../../utils/capacityUtils");

//@desc   Add new hotel
//@route  POST /api/hotels
//@access Private

const addHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.create(req.body);
  res.status(200).json(hotel);
});

//@desc   Update hotel
//@route  PATCH /api/hotels/:hotelId
//@access Private

const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.hotelId, req.body, {
    new: true,
  })
    .populate("locationId")
    .populate("food")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate("periods")
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  res.status(200).json(hotel);
});

const getHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find()
    .populate("locationId")
    .populate("food")
    .populate("rooms")
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  res.status(200).json(hotels);
});

//@desc   Get all hotels for admin
//@route  GET /api/hotels/admin
//@access Private

const getAdminHotels = asyncHandler(async (req, res) => {
  const { name, locationId, minAge } = req.query;

  const query = {};

  if (name && name != "") {
    query.name = name;
  }

  if (minAge && minAge != 0) {
    query.minAge = minAge;
  }

  if (locationId && locationId != "") {
    query.locationId = locationId;
  }

  const hotels = await Hotel.find(query)
    .populate("locationId")
    .populate("food")
    .populate("rooms")
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });

  res.status(200).json(hotels);
});

//@desc   Get hotel by id
//@route  GET /api/hotels/:id
//@access Public

const getSingleHotel = asyncHandler(async (req, res) => {
  let query = Hotel.findById(req.params.id)
    .populate("locationId")
    .populate("food")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate("periods")
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });

  if (req.query.agesArray) {
    query = query.populate({
      path: "rooms",
      match: {
        $expr: {
          $gte: [
            {
              $sum: [
                "$capacity",
                {
                  $size: {
                    $filter: {
                      input: "$extraPlaces",
                      as: "extraPlace",
                      cond: { $ne: ["$$extraPlace.isBabyPlace", true] },
                    },
                  },
                },
              ],
            },
            { $size: req.query.agesArray },
          ],
        },
      },
    });
  }

  const singleHotel = await query.exec();
  res.status(200).json(singleHotel);
});

//@desc   Get searched hotels
//@route  GET /api/hotels/searched
//@access Public

const getSearchedHotels = asyncHandler(async (req, res) => {
  const {
    dashMode,
    agesArray,
    daysAmount,
    start,
    locationId,
    filterFood,
    filterStars,
    filterRating,
    filterServices,
    filterBathroom,
    filterExtraPlaces,
    searchNameId,
    minPrice,
    maxPrice,
  } = req.query;

  let ages = agesArray.split(",").map(Number);
  const peopleAmount = ages.length;
  const kidsAmount = ages.filter((age) => age !== 1000).length;
  const adultsAmount = ages.filter((age) => age === 1000).length;

  const calculatePrice = (start, daysNum, basePrice, pricesArray) => {
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

          if (isDateInRange(date, startMonth, startDay, endMonth, endDay)) {
            console.log(
              "date: ",
              date,
              startDay,
              "/",
              startMonth,
              " - ",
              endDay,
              "/",
              endMonth
            );
            sum += el.roomPrice;
            priceFound = true;
          }
        });
        if (!priceFound) {
          sum += 0;
          console.log("!priceFound");
        }
      } else {
        sum += 0;
        console.log("else");
      }
    };

    for (let i = 0; i < daysNum; i++) {
      findPriceByDate(daysArray[i]);
    }

    if (sum === 0) {
      console.log(sum);
      return null;
    }

    return sum;
  };

  let query = {};

  if (locationId && locationId !== "") {
    query.locationId = locationId;
  }
  if (filterFood && filterFood !== "") {
    query.food = {
      $in: filterFood.split(","),
    };
  }
  if (filterStars && filterStars !== undefined) {
    query.hotelStars = filterStars;
  }
  if (filterRating && filterRating !== undefined) {
    query.rating = {
      $in: filterRating.split(","),
    };
  }
  if (filterServices && filterServices.length > 0) {
    query.hotelServices = { $in: filterServices.split(",") };
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

  let adminHotels = [];
  if (dashMode && dashMode !== "false") {
    adminHotels = await Hotel.find(query)
      .populate("locationId")
      .populate("food")
      .populate("rooms")
      .populate({
        path: "rooms",
        populate: {
          path: "periodPrices.period",
          model: "Period",
        },
      })
      .populate({
        path: "hotelServices",
        populate: {
          path: "category",
          model: "Category",
        },
      });
    return res.status(200).json(adminHotels);
  }

  let hotels = await Hotel.find(query)
    .populate("locationId")
    .populate("food")
    .populate("rooms")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });

  hotels = hotels
    .filter((hotel) =>
      hotel.rooms.some((room) =>
        filterBathroom ? room.bathroom.type === filterBathroom : true
      )
    )
    .filter((hotel) => {
      return hotel.rooms.length > 0;
    });

  if (hotels.length === 0) res.status(404);

  const newHotels = hotels.map((hotel) => {
    const newHotel = hotel.toObject();
    let rooms = newHotel.rooms;

    rooms = rooms.filter((room) => {
      return filterExtraPlaces
        ? checkCapacity(
            ages,
            room.extraPlaces,
            hotel.kids.babyMaxAge,
            room.freeBabyPlaces,
            room.totalExtraPlacesAmount,
            room.capacity
          )
        : checkCapacity(
            ages,
            room.extraPlaces,
            hotel.kids.babyMaxAge,
            room.freeBabyPlaces,
            0,
            room.capacity
          );
    });

    const cheapestRoom = rooms.reduce(
      (prev, curr) =>
        prev.periodPrices[0]?.roomPrice < curr.periodPrices[0]?.roomPrice
          ? prev
          : curr,
      rooms[0]
    );

    let sum = 0;

    if (cheapestRoom) {
      const pricesArray = cheapestRoom?.periodPrices;

      ages = removeAges(
        ages,
        cheapestRoom?.freeBabyPlaces,
        hotel.kids.babyMaxAge
      );
      let placesArray = cheapestRoom?.extraPlaces;
      ages.sort((a, b) => b - a);

      sum = calculateExtraPlaces(
        ages,
        placesArray,
        cheapestRoom,
        "false",
        daysAmount
      );

      const costOfStay =
        sum + calculatePrice(start, daysAmount, 0, pricesArray);

      const margePercent = (newHotel.marge + 100) / 100;

      if (
        costOfStay &&
        newHotel &&
        calculatePrice(start, daysAmount, 0, pricesArray) !== 0
      ) {
        return {
          ...newHotel,
          totalPrice: margePercent
            ? Math.round(costOfStay * margePercent)
            : costOfStay,
          daysAmount: +daysAmount,
          nightsAmount: daysAmount - 1,
          adultsAmount: +adultsAmount,
          kidsAmount: +kidsAmount,
        };
      } else {
        return { ...newHotel, totalPrice: 0 };
      }
    }
  });

  // console.log(newHotels, "before res json");

  res
    .status(200)
    .json(
      newHotels
        .filter((hotel) => hotel !== undefined)
        .filter((hotel) => hotel.totalPrice !== 0)
    );

  // res
  //   .status(200)
  //   .send(
  //     minPrice && maxPrice
  //       ? newHotels
  //           .filter(
  //             (hotel) =>
  //               hotel?.totalPrice <= maxPrice && hotel?.totalPrice >= minPrice
  //           )
  //           .filter(
  //             (hotel) =>
  //               hotel.totalPrice !== null &&
  //               hotel.totalPrice !== 0 &&
  //               hotel.totalPrice
  //           )
  //       : newHotels.filter((hotel) => hotel.totalPrice)
  //   );
});

//@desc   Calculate the price of hotel
//@route  GET /api/hotels/:hotelId/price
//@access Public

const getPrice = asyncHandler(async (req, res) => {
  const {
    addRoomFood,
    addExtraFood,
    start,
    daysAmount,
    agesArray,
    hotelId,
    roomId,
    personMode,
    excursionsArray,
    kidsFoodAmount,
    adultsFoodAmount,
  } = req.query;

  let ages = agesArray.split(",").map(Number);
  let excursions = [];

  if (excursionsArray && excursionsArray.length > 0)
    excursions = excursionsArray?.split(",");

  // console.log(excursions);

  const hotel = await Hotel.findById(hotelId)
    .populate("locationId")
    .populate("food")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate({
      path: "hotelServices",
      populate: {
        path: "category",
        model: "Category",
      },
    });

  const chosenRoom = hotel.rooms.find((room) => room._id == roomId);

  if (!chosenRoom) return res.status(404).json({ error: "Номер не выбран" });

  let sum = 0;
  let extraPlacesSum = 0;
  let roomSum = 0;
  let excursionsSum = 0;
  let foodSum = 0;

  console.log(
    ages.length -
      removeAges(ages, chosenRoom.freeBabyPlaces, hotel.kids.babyMaxAge).length,
    "amount of free baby places"
  );

  const usedBabyPlaces =
    ages.length -
    removeAges(ages, chosenRoom.freeBabyPlaces, hotel.kids.babyMaxAge).length;

  const usedExtraPlaces =
    removeAges(ages, chosenRoom.freeBabyPlaces, hotel.kids.babyMaxAge).length -
    chosenRoom.capacity;

  // Remove babies which will be appointed to a free extra place
  ages = removeAges(ages, chosenRoom.freeBabyPlaces, hotel.kids.babyMaxAge);

  let placesArray = chosenRoom.extraPlaces;

  ages.sort((a, b) => b - a);

  if (ages.length > chosenRoom.capacity + chosenRoom.totalExtraPlacesAmount) {
    return res
      .status(404)
      .json({ error: "Номер не может поместить всех жильцов" });
  }

  // [1000, 1000, 15, 4,...]
  const accomodatedAges = ages.splice(0, chosenRoom.capacity);
  let agesToCheckExtraPlaces = ages;

  console.log(accomodatedAges, "accomodated ages");
  console.log(agesToCheckExtraPlaces, "ages after accomodation");

  if (checkExtraPlaces(agesToCheckExtraPlaces, placesArray)) {
    return res
      .status(404)
      .json({ error: "Номер не может поместить всех жильцов" });
  }

  sum = calculateExtraPlaces(
    ages,
    placesArray,
    chosenRoom,
    addExtraFood,
    daysAmount
  );
  extraPlacesSum = calculateExtraPlaces(
    ages,
    placesArray,
    chosenRoom,
    addExtraFood,
    daysAmount
  );

  async function calculatePrice(start, daysNum, pricesArray) {
    let daysArray = daysIntoArray(start, daysNum);

    const findPriceByDate = (date) => {
      if (pricesArray && pricesArray.length > 0) {
        let priceFound = false;
        pricesArray.forEach((el) => {
          const startMonth = el.period.startMonth;
          const startDay = el.period.startDay;
          const endMonth = el.period.endMonth;
          const endDay = el.period.endDay;

          if (isDateInRange(date, startMonth, startDay, endMonth, endDay)) {
            // console.log(startDay, startMonth, endDay, endMonth, "period date");
            if (!personMode) {
              sum += el.roomPrice;
              roomSum += el.roomPrice;
              // console.log("sum += el.roomPrice");
              priceFound = true;
            } else {
              accomodatedAges.forEach((age) => {
                if (age === 1000) {
                  sum += el.adultPrice;
                  roomSum += el.roomPrice;
                  // console.log("sum += el.adultPrice");
                } else {
                  sum += el.kidPrice;
                  roomSum += el.roomPrice;
                  // console.log("sum += el.kidPrice;");
                }
              });
              priceFound = true;
            }
          }
        });
        if (!priceFound) {
          res
            .status(404)
            .json({ error: "Не все даты подходят для этого отеля" });
        }
      } else {
        res.status(404).json({ error: "У этого номера не установлены цены" });
      }
      // console.log(sum);
    };

    for (let i = 0; i < daysNum; i++) {
      findPriceByDate(daysArray[i]);
    }

    (function calculateFood() {
      if (addRoomFood && kidsFoodAmount !== 0 && adultsFoodAmount !== 0) {
        for (let i = 0; i < daysAmount; i++) {
          for (let i = 0; i < kidsFoodAmount; i++) {
            sum += hotel.kidFoodPrice;
            foodSum += hotel.kidFoodPrice;
            // console.log("kid food");
          }
          for (let i = 0; i < adultsFoodAmount; i++) {
            sum += hotel.adultFoodPrice;
            foodSum += hotel.adultFoodPrice;
            // console.log("adult food");
          }
        }
      }
    })();

    async function calculateExcursionPrices() {
      if (excursions && excursions.length > 0) {
        for (const id of excursions) {
          const excursion = await Excursion.findById(id);
          if (excursion && excursion.price) {
            sum += excursion.price * agesArray.split(",").length;
            excursionsSum += excursion.price * agesArray.split(",").length;
          }
        }
      }
    }

    if (excursions && excursions.length > 0) {
      await calculateExcursionPrices();
    }
  }

  await calculatePrice(start, daysAmount, chosenRoom.periodPrices);

  const margePercent = (hotel.marge + 100) / 100;

  return sum > 0
    ? res.status(200).json({
        sum: margePercent ? Math.round(sum * margePercent) : sum,
        margeSum: (sum * hotel.marge) / 100,
        extraPlacesSum: extraPlacesSum * margePercent,
        excursionsSum: excursionsSum * margePercent,
        foodSum: foodSum * margePercent,
        roomSum: roomSum * margePercent,
        kidsFoodAmount: kidsFoodAmount,
        adultsFoodAmount: adultsFoodAmount,
        usedBabyPlaces:
          usedBabyPlaces && usedBabyPlaces !== 0 ? usedBabyPlaces : null,
        usedExtraPlaces:
          usedExtraPlaces && usedExtraPlaces !== 0 ? usedExtraPlaces : null,
      })
    : res.status(404).json({ error: "Не удалось подсчитать" });
});

//@desc   Get room by prices
//@route  GET /api/hotels/:hotelId/price
//@access Public

const getRoomPrices = (req, res) => {
  Hotel.findOne({ _id: req.params.hotelId })
    .populate("rooms")
    .then((response) => res.status(200).json(response.rooms))
    .catch(() => res.sendStatus(400));
};

// Get rooms with limit

const getRoomsByLimit = async (req, res) => {
  const { limit, capacity, agesArray } = req.query;
  const { hotelId } = req.params;

  const ages = agesArray.split(",").map(Number);
  let roomData = [];

  try {
    const hotel = await Hotel.findOne({ _id: hotelId });

    try {
      const rooms = await Room.aggregate([
        {
          $match: {
            _id: {
              $in: hotel.rooms,
            },
          },
        },
      ]);

      let filteredRooms = [];

      if (ages && rooms && rooms.length > 0 && hotel) {
        filteredRooms = rooms.filter((room) => {
          console.log(
            checkCapacity(
              ages,
              room.extraPlaces,
              hotel.kids.babyMaxAge,
              room.freeBabyPlaces,
              room.totalExtraPlacesAmount,
              room.capacity
            ),
            "check capacity"
          );
          return checkCapacity(
            ages,
            room.extraPlaces,
            hotel.kids.babyMaxAge,
            room.freeBabyPlaces,
            room.totalExtraPlacesAmount,
            room.capacity
          );
        });
      }

      console.log("-----------------------------------");

      // console.log(filteredRooms, "filtered rooms");

      const modifiedRooms = filteredRooms?.map((room) => {
        console.log(
          removeAges(ages, room.freeBabyPlaces, hotel.kids.babyMaxAge).length,
          room.capacity,
          room.roomName,
          "test"
        );

        const usedFreeBabyPlaces =
          ages.length -
          removeAges(ages, room.freeBabyPlaces, hotel.kids.babyMaxAge).length;

        const usedExtraPlaces =
          removeAges(ages, room.freeBabyPlaces, hotel.kids.babyMaxAge).length -
            room.capacity <
          0
            ? null
            : removeAges(ages, room.freeBabyPlaces, hotel.kids.babyMaxAge)
                .length - room.capacity;

        return {
          ...room,
          usedFreeBabyPlaces: usedFreeBabyPlaces,
          usedExtraPlaces,
        };
      });

      const realLimit = Math.min(modifiedRooms.length, parseInt(limit));

      const limitedRooms = modifiedRooms.slice(0, realLimit);

      const response = {
        totalRooms: rooms.length, // Include the total number of rooms in the response
        rooms: limitedRooms,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  } catch (err) {
    res.sendStatus(404);
  }
};

const getByTagRecommendation = async (req, res) => {
  const { food, comforts, hotelServices } = req.body;
  let query = {};
  let or = [];

  if (food) {
    query.food = {
      _id: food,
    };

    or.push(query);
  }
  if (hotelServices && hotelServices.length > 0) {
    for (let i = 0; i < hotelServices.length; i++) {
      let q = {};
      if (hotelServices[i] !== "") {
        q.hotelServices = {
          $in: [hotelServices[i]],
        };
        or.push(q);
      }
    }
  }

  if (comforts && comforts.length > 0) {
    for (let i = 0; i < comforts.length; i++) {
      let q = {};
      if (comforts[i] !== "") {
        q.comforts = {
          $in: [comforts[i]],
        };
        or.push(q);
      }
    }
  }

  try {
    const hotels = await Hotel.find({ $or: or })
      .limit(4)
      .populate("locationId")
      .populate("food");
    // .populate("hotelServices._id");

    if (hotels.length === 0) {
      res.sendStatus(404);
    } else {
      res.status(200).json(hotels);
    }
  } catch (error) {
    res.sendStatus(400);
  }
};

const getPriceRanges = async (req, res) => {
  const { start, duration, hotelId } = req.query;
  const daysArray = daysIntoArray(start, duration);

  const monthArray = [];
  let currentMonth = -1;

  for (const day of daysArray) {
    const date = new Date(day);
    const month = date.getMonth() + 1;

    if (month !== currentMonth) {
      monthArray.push({ month, count: 1 });
      currentMonth = month;
    } else {
      monthArray[monthArray.length - 1].count++;
    }
  }
  try {
    const dateObj = {
      start: {
        day: daysArray[0].getDate(),
        month: daysArray[0].getUTCMonth() + 1,
      },
      end: {
        day: daysArray[daysArray.length - 1].getDate(),
        month: daysArray[daysArray.length - 1].getMonth() + 1,
      },
    };
    const hotel = await Hotel.findOne({ _id: hotelId });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const roomIds = hotel.rooms;

    const hotelRooms = await Room.find({
      _id: { $in: roomIds },
    });

    if (!hotelRooms || hotelRooms.length === 0) {
      return res.status(404).json({ message: "No rooms found" });
    }

    const periodPrices = hotelRooms.map((room) => room.periodPrices);

    const periodPriceArray = periodPrices.flat();
    const perIds = periodPriceArray.map((per) => per.period);

    const periods = await Period.find({
      _id: {
        $in: perIds,
      },
    });

    if (!periods || periods.length === 0) {
      return res.status(404).json({ message: "Cannot find periods" });
    }

    const prices = periodPriceArray.map((price) => ({
      roomPrice: price.roomPrice,
      periodId: price.period,
    }));

    let range = prices
      .map((price, idx) => {
        if (price.periodId.equals(periods[idx]?._id)) {
          const month = periods[idx].startMonth;
          const count =
            monthArray.find((item) => item.month === month)?.count || duration;
          const multipliedPrice = price.roomPrice * count;

          return {
            price: multipliedPrice,
            date: `${periods[idx].startDay}.${periods[idx].startMonth} - ${periods[idx].endDay}.${periods[idx].endMonth}`,
            month: periods[idx].startMonth,
            isCurrent:
              (periods[idx].startMonth >= dateObj.start.month &&
                periods[idx].startMonth <= dateObj.end.month) ||
              (periods[idx].endMonth >= dateObj.start.month &&
                periods[idx].endMonth <= dateObj.end.month),
          };
        }
      })
      .filter(Boolean);
    res.status(200).json(range);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

module.exports = {
  addHotel,
  getHotels,
  getSearchedHotels,
  getSingleHotel,
  getAdminHotels,
  updateHotel,
  // updateHotelPeriods,
  // deletePeriod,
  getPrice,
  //test
  getRoomPrices,
  getRoomsByLimit,
  getByTagRecommendation,
  getPriceRanges,
};
