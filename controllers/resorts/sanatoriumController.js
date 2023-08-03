const { Sanatorium } = require("../../models/resorts/sanatoriumModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Room = require("../../models/roomModel");
const Period = require("../../models/periodModel");
const Food = require("../../models/services/foodModel");
const Excursion = require("../../models/excursionModel");
const { removeAges } = require("../../utils/removeFreeBabyPlaces");
const { checkCapacity } = require("../../utils/capacityUtils");

const addSanatorium = async (req, res) => {
  const post = await Sanatorium.create(req.body);
  res.status(200).json(post);
};

//@desc   Update sanatorium
//@route  PATCH /api/sanatoriums/:sanatoriumId
//@access Private

const updateSanatorium = asyncHandler(async (req, res) => {
  const hotel = await Sanatorium.findByIdAndUpdate(
    req.params.sanatoriumId,
    req.body,
    {
      new: true,
    }
  )
    .populate("locationId")
    .populate("rooms")
    .populate("sanatoriumProgram.programId")
    .populate("food.foodType")
    .populate("periods")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate({
      path: "sanatoriumServices.serviceType",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  res.status(200).json(hotel);
});

//@desc   Get sanatoriums
//@route  GET /api/sanatoriums
//@access Private

const getSanatoriums = (req, res) => {
  Sanatorium.find()
    .populate("locationId")
    .then((response) => res.status(200).json(response))
    .catch((err) => res.sendStatus(403));
};

// TODO: Спросить у Стаса | спросил? не помню
const getAdminSanatoriums = (req, res) => {
  const { name, locationId, minAge } = req.query;
};

//@desc   Get single sanatorium
//@route  GET /api/sanatoriums/:sanatoriumId
//@access Public

const getSingleSanatorium = asyncHandler(async (req, res) => {
  let query = Sanatorium.findById(req.params.sanatoriumId)
    .populate("locationId")
    .populate("rooms")
    .populate("sanatoriumProgram.programId")
    .populate("food.foodType")
    .populate("periods")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate({
      path: "sanatoriumServices.serviceType",
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

  const singleSanatorium = await query.exec();
  res.status(200).json(singleSanatorium);
});

//@desc   Calculate the price of hotel
//@route  GET /api/hotels/:hotelId/price
//@access Public

const getPrice = asyncHandler(async (req, res) => {
  const {
    start,
    daysAmount,
    agesArray,
    sanatoriumId,
    roomId,
    personMode,
    excursionsArray,
  } = req.query;

  let ages = agesArray.split(",").map(Number);
  const peopleAmount = agesArray.split(",").map(Number).length;
  const kidsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age !== 1000).length;
  const adultsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age === 1000).length;

  const hotel = await Sanatorium.findById(sanatoriumId).populate({
    path: "rooms",
    populate: {
      path: "periodPrices.period",
      model: "Period",
    },
  });

  const chosenRoom = hotel.rooms.find((room) => room._id == roomId);
  if (!chosenRoom) return res.status(404).json({ error: "Номер не выбран" });

  if (ages.length > chosenRoom.capacity) {
    return res
      .status(404)
      .json({ error: "Номер не может поместить всех жильцов" });
  }

  let sum = 0;
  let roomSum = 0;
  let extraPlacesSum = 0;
  let excursionsSum = 0;
  let foodSum = 0;
  let chosenPlaces = [];

  ages.sort((a, b) => b - a);

  async function calculatePrice(start, daysNum, basePrice, pricesArray) {
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
            if (!personMode) {
              sum += el.roomPrice;
              roomSum += el.roomPrice;
              console.log("sum += el.roomPrice");
              priceFound = true;
            } else {
              accomodatedAges.forEach((age) => {
                if (age === 1000) {
                  sum += el.adultPrice;
                  roomSum += el.roomPrice;
                  console.log("sum += el.adultPrice");
                } else {
                  sum += el.kidPrice;
                  roomSum += el.roomPrice;
                  console.log("sum += el.kidPrice;");
                }
              });
              priceFound = true;
            }
          }
        });
        if (!priceFound) {
          res
            .status(404)
            .json({ error: "Не все даты подходят для этого санатория" });
        }
      } else {
        res.status(404).json({ error: "У этого номера не установлены цены" });
      }
      // console.log(sum);
    };

    for (let i = 0; i < daysNum; i++) {
      findPriceByDate(daysArray[i]);
    }
  }

  await calculatePrice(start, daysAmount, 2, chosenRoom.periodPrices);

  const margePercent = (hotel.marge + 100) / 100;

  sum > 0
    ? res.status(200).json({
        sum: margePercent ? Math.round(sum * margePercent) : sum,
        margeSum: (sum * hotel.marge) / 100,
        roomSum: roomSum,
      })
    : res.status(404).json({ error: "Не удалось подсчитать" });
});

// Get rooms with limit

const getRoomsByLimit = async (req, res) => {
  const { limit, capacity, agesArray } = req.query;
  const { sanatoriumId } = req.params;

  const ages = agesArray.split(",").map(Number);
  let roomData = [];

  try {
    const sanatorium = await Sanatorium.findOne({ _id: sanatoriumId });

    try {
      const rooms = await Room.aggregate([
        {
          $match: {
            _id: {
              $in: sanatorium.rooms,
            },
          },
        },
      ]);

      let filteredRooms = rooms.filter((room) => room.capacity >= ages.length);

      const realLimit = Math.min(filteredRooms.length, parseInt(limit));
      const limitedRooms = filteredRooms.slice(0, realLimit);

      const response = {
        totalRooms: rooms.length, // Include the total number of rooms in the response
        rooms: limitedRooms,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }

    console.log(roomData);
  } catch (err) {
    res.sendStatus(404);
  }
};

//@desc   Get searched sanatoriums
//@route  GET /api/sanatoriums/searched
//@access Public

const getSearchedSanatoriums = asyncHandler(async (req, res) => {
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

  let ages = agesArray.split(",").map(Number);
  const peopleAmount = agesArray.split(",").map(Number).length;
  const kidsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age !== 1000).length;
  const adultsAmount = agesArray
    .split(",")
    .map(Number)
    .filter((age) => age === 1000).length;

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

          console.log(
            startDay,
            "/",
            startMonth,
            " - ",
            endDay,
            "/",
            endMonth,
            "period dates"
          );

          if (isDateInRange(date, startMonth, startDay, endMonth, endDay)) {
            console.log(el.roomPrice, "el roomrpice");
            sum += el.roomPrice;
            priceFound = true;
          }
        });
        if (!priceFound) {
          sum += basePrice;
        }
      } else {
        sum += basePrice;
      }
    };

    for (let i = 0; i < daysNum; i++) {
      findPriceByDate(daysArray[i]);
    }

    if (sum === 0) {
      return null;
    }

    return sum;
  };

  let query = {};

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

  let adminSanatoriums;
  if (dashMode && dashMode !== "false") {
    adminSanatoriums = await Sanatorium.find(query)
      .populate("locationId")
      .populate({
        path: "food",
        populate: {
          path: "food.foodType",
          model: "Food",
        },
      })
      .populate("rooms")
      .populate({
        path: "rooms",
        populate: {
          path: "periodPrices.period",
          model: "Period",
        },
        match: {
          $expr: {
            $gte: ["$capacity", peopleAmount],
          },
        },
      })
      .populate({
        path: "sanatoriumServices.serviceType",
        populate: {
          path: "category",
          model: "Category",
        },
      });
    return res.status(200).json(adminSanatoriums);
  }

  let hotels = await Sanatorium.find(query)
    .populate("locationId")
    .populate({
      path: "food",
      populate: {
        path: "food.foodType",
        model: "Food",
      },
    })
    .populate("rooms")
    .populate({
      path: "rooms",
      populate: {
        path: "periodPrices.period",
        model: "Period",
      },
    })
    .populate({
      path: "sanatoriumServices.serviceType",
      populate: {
        path: "category",
        model: "Category",
      },
    });

  hotels = hotels.filter((hotel) => hotel.rooms.length > 0);

  const newHotels = hotels.map((hotel) => {
    const newHotel = hotel.toObject();
    const rooms = newHotel.rooms;
    const cheapestRoom = rooms.reduce(
      (prev, curr) =>
        prev.periodPrices[0].roomPrice < curr.periodPrices[0].roomPrice
          ? prev
          : curr,
      rooms[0]
    );
    console.log(cheapestRoom?.roomName, "sanatorium rooms");
    const pricesArray = cheapestRoom?.periodPrices;

    const costOfStay = calculatePrice(start, daysAmount, 0, pricesArray);

    const margePercent = (newHotel.marge + 100) / 100;

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
  });

  res
    .status(200)
    .send(
      minPrice && maxPrice
        ? newHotels
            .filter(
              (hotel) =>
                hotel?.totalPrice <= maxPrice && hotel?.totalPrice >= minPrice
            )
            .filter(
              (hotel) =>
                hotel.totalPrice !== null &&
                hotel.totalPrice !== 0 &&
                hotel.totalPrice
            )
        : newHotels.filter((hotel) => hotel?.totalPrice)
    );
});

module.exports = {
  getSingleSanatorium,
  getSanatoriums,
  addSanatorium,
  getPrice,
  getRoomsByLimit,
  getSearchedSanatoriums,
  updateSanatorium,
  // TODO!: Спросить
  // getAdminSanatoriums,
};
