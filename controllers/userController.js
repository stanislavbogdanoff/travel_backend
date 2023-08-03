const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

//@desc   Register new user
//@route  POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Add all fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Email already taken");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc   Authorize user
//@route  POST /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  console.log(user);

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials!");
  }
});

//  Generate user JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const getUsers = (req, res) => {
  User.find({})
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(500).json(err));
};

const deleteUsers = async (req, res) => {
  const { managerIds } = req.body;
  console.log(managerIds, "managerIds");
  const del = await User.deleteMany({ _id: { $in: managerIds } });
  res.status(200).json(del);
};

const findManagers = (req, res) => {
  const { query } = req.query;

  let q = {};
  // TODO: Поменять после того как появиться uid

  if (query && query !== "") {
    q = {
      name: {
        $options: "i",
        $regex: query,
      },
    };
  }

  User.find(q)
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  deleteUsers,
  findManagers,
};
