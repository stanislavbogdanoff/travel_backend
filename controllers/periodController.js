const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Period = require("../models/periodModel");
const { Hotel } = require("../models/resorts/hotelModel");
const Sanatorium = require("../models/resorts/sanatoriumModel");
const Tour = require("../models/resorts/tourModel");
const Camp = require("../models/resorts/campModel");
const Room = require("../models/roomModel");
const { comparePeriods } = require("../utils/periodUtils");

//@desc   Get periods
//@route  GET /api/periods
//@access Public

const getPeriods = asyncHandler(async (req, res) => {
  const period = await Period.find();
  res.status(200).json(period);
});

//@desc   Get periods by hotel
//@route  GET /api/periods/:hotelId
//@access Public

const getPeriodsByHotel = asyncHandler(async (req, res) => {
  const period = await Period.find({ hotel: req.params.hotelId });
  res.status(200).json(period);
});

/***************************************** ADDING PERIODS *****************************************/

//@desc   Add new hotel periods
//@route  POST /api/periods
//@access Private

const addPeriods = asyncHandler(async (req, res) => {
  const { periods } = req.body;

  if (periods) {
    periods.sort(comparePeriods);
    try {
      const newPeriods = [];

      for (const [idx, period] of periods.entries()) {
        console.log(period, "period #" + idx);
        let periodObj;

        if (!period._id) {
          periodObj = await Period.create(period);
          const hotel = await Hotel.findOneAndUpdate(
            { _id: periodObj.hotel },
            {
              $push: {
                periods: periodObj,
              },
            }
          );

          if (hotel && hotel.rooms) {
            for (const room of hotel.rooms) {
              await Room.findByIdAndUpdate(room, {
                $push: {
                  periodPrices: {
                    period: periodObj._id,
                    roomPrice: 0,
                    adultPrice: 0,
                    kidPrice: 0,
                  },
                },
              });
            }
          }

          newPeriods.push(periodObj);
        }
      }

      res.status(200).json(newPeriods);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

//@desc   Add new sanatorium periods
//@route  POST /api/periods/sanatorium
//@access Private

const addSanatoriumPeriods = asyncHandler(async (req, res) => {
  const { periods } = req.body;

  if (periods) {
    periods.sort(comparePeriods);
    try {
      const newPeriods = await Promise.all(
        periods.map(async (period) => {
          let periodObj;
          if (!period._id) {
            periodObj = await Period.create(period);
            const sanatorium = await Sanatorium.findOneAndUpdate(
              { _id: periodObj.sanatorium },
              {
                $push: {
                  periods: periodObj,
                },
              }
            );

            if (sanatorium && sanatorium.rooms) {
              for (const room of sanatorium.rooms) {
                await Room.findByIdAndUpdate(room, {
                  $push: {
                    periodPrices: {
                      period: periodObj._id,
                      roomPrice: 0,
                      adultPrice: 0,
                      kidPrice: 0,
                    },
                  },
                });
              }
            }

            return periodObj;
          } else return;
        })
      );

      res.status(200).json(newPeriods);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

//@desc   Add new tour periods
//@route  POST /api/periods/tour
//@access Private

const addTourPeriods = asyncHandler(async (req, res) => {
  const { periods } = req.body;

  if (periods) {
    periods.sort(comparePeriods);
    try {
      const newPeriods = [];

      for (const period of periods) {
        let periodObj;

        if (!period._id) {
          periodObj = await Period.create(period);
          console.log(periodObj);

          if (periodObj.tour) {
            await Tour.findOneAndUpdate(
              { _id: periodObj.tour },
              {
                $push: {
                  periodPrices: {
                    period: periodObj._id,
                    adultPrice: 0,
                    kidPrice: 0,
                  },
                  periods: periodObj._id,
                },
              }
            );
          }

          newPeriods.push(periodObj);
        }
      }

      res.status(200).json(newPeriods);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

//@desc   Add new camp periods
//@route  POST /api/periods/camp
//@access Private

const addCampPeriods = asyncHandler(async (req, res) => {
  const { periods } = req.body;

  if (periods) {
    periods.sort(comparePeriods);
    try {
      const newPeriods = await Promise.all(
        periods.map(async (period) => {
          let periodObj;

          if (!period._id) {
            periodObj = await Period.create(period);

            if (periodObj.camp) {
              await Camp.findOneAndUpdate(
                { _id: periodObj.camp },
                {
                  $push: { periods: periodObj._id },
                  $addToSet: {
                    "agePrices.$[].periodPrices": {
                      period: periodObj._id,
                      campPrice: 0,
                    },
                  },
                }
              );
            }

            return periodObj;
          } else {
            return;
          }
        })
      );

      res.status(200).json(newPeriods);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

/***************************************** DELETING PERIODS *****************************************/

//@desc   Delete hotel period
//@route  DELETE /api/periods
//@access Public

const deletePeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;

  const period = await Period.findById(periodId);
  await Period.deleteOne({ _id: periodId });

  const hotel = await Hotel.findByIdAndUpdate(period.hotel, {
    $pull: {
      periods: periodId,
    },
  });

  if (hotel.rooms && hotel.rooms.length > 0) {
    try {
      for (const roomId of hotel.rooms) {
        console.log(roomId);
        await Room.findByIdAndUpdate(roomId, {
          $pull: {
            periodPrices: {
              period: periodId,
            },
          },
        });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  res.status(200).send("Deleted successfully");
});

//@desc   Delete sanatorium period
//@route  DELETE /api/periods
//@access Public

const deleteSanatoriumPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;

  const period = await Period.findById(periodId);
  await Period.deleteOne({ _id: periodId });

  const sanatorium = await Sanatorium.findByIdAndUpdate(period.hotel, {
    $pull: {
      periods: periodId,
    },
  });

  if (sanatorium.rooms && sanatorium.rooms.length > 0) {
    try {
      for (const roomId of sanatorium.rooms) {
        console.log(roomId);
        await Room.findByIdAndUpdate(roomId, {
          $pull: {
            periodPrices: {
              period: periodId,
            },
          },
        });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  res.status(200).send("Deleted successfully");
});

//@desc   Delete sanatorium period
//@route  DELETE /api/periods
//@access Public

const deleteTourPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;

  const period = await Period.findById(periodId);
  await Period.deleteOne({ _id: periodId });

  const tour = await Tour.findByIdAndUpdate(period.tour, {
    $pull: {
      periodPrices: {
        period: periodId,
      },
      periods: periodId,
    },
  });

  res.status(200).send("Deleted successfully");
});

//@desc   Delete sanatorium period
//@route  DELETE /api/periods
//@access Public

const deleteCampPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;

  const period = await Period.findById(periodId);
  await Period.deleteOne({ _id: periodId });

  const camp = await Camp.findOneAndUpdate(
    { _id: period.camp },
    {
      $pull: {
        periods: periodId,
        "agePrices.$[].periodPrices": {
          period: periodId,
        },
      },
    },
    { new: true }
  );

  res.status(200).send("Deleted successfully");
});

module.exports = {
  getPeriods,
  addPeriods,
  getPeriodsByHotel,
  deletePeriod,
  addSanatoriumPeriods,
  deleteSanatoriumPeriod,
  addTourPeriods,
  deleteTourPeriod,
  addCampPeriods,
  deleteCampPeriod,
};
