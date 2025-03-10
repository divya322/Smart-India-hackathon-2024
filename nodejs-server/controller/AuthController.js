const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  let email = req.body.email;
  const exists = await User.exists({ email });
  if (exists) {
    res.status(200).json({
      code: 404,
      message: "User already exists",
    });
  } else {
    bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
      if (err) {
        res.json({
          error: err,
        });
      }
      let user = new User({
        employeeID : req.body.employeeID,
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: hashedPass,
      });
      user
        .save()
        .then((user) => {
          res.status(200).json({
            code: 200,
            message: "user added successfully",
          });
        })
        .catch((error) => {
          res.status(500).json({
            code: 500,
            error,
            message: "error occured",
          });
        });
    });
  }
};

const login = async (req, res) => {
  let email = req.body.email;
  await User.findOne({ email })
    .then((user) => {
      if (user) {
        let password = req.body.password;
        bcrypt.compare(password, user.password, function (error, result) {
          if (error) {
            delete (password);
            res.json({
              error,
            });
          }
          if (result) {
            delete (password);
            let token = jwt.sign({ name: user.employeeID }, "AzQPI!", {expiresIn: "24h"});
            // let refreshtoken = jwt.sign({ name: user.employeeID }, 'secretrefreshtoken', {expiresIn: "24h"});
            // res.cookie('jwt',token, { httpOnly: false, secure: false, maxAge: 3600000 });
            res.status(200).json({
              code: 200,
              user: {
                _id: user._id,
                employeeID : user.employeeID,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                token,
              },
              // refreshtoken
            });
          } else {
            res.status(200).json({
              code: 401,
              message: "password does not match",
            });
          }
        });
      } else {
        res.status(200).json({
          code: 404,
          message: "no user found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        code: 500,
        error,
        message: "Try again",
      });
    });
};

module.exports = {
  register,
  login,
};
