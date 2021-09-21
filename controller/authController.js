var express = require("express");
var router = express.Router();
import size from "lodash/size";
import {
  authError,
  comparePass,
  DBConnection,
  EncryptPass,
  getJwtoken,
} from "../middleware";
import User from "../Model/User";
import first from "lodash/first";
import omit from "lodash/omit";

//import { minifySVG } from "../compress";
router.use(DBConnection, authError);
router.use("/register", EncryptPass, authError);

var routes = () => {
  router.post("/register", async (req, res) => {
    try {
      let {
        body: { user },
      } = req;

      const { email } = user;
      User.aggregate([
        {
          $match: {
            $or: [{ email }],
          },
        },
      ]).then((results) => {
        if (size(results) > 0) {
          res.json({ error: "Username or Email already registered!" });
        } else {
          user = new User(user);
          user.save(async (err, user) => {
            if (err) {
              res.status(500).send(err);
            } else {
              response.token = await getJwtoken(req, omit(user, "password"));
              res.json({
                data: response,
                message: "Account Created Successfully",
              });
            }
          });
        }
      });
    } catch (error) {
      res.status(500).send(error);
    }
  });

  router.get("/verify", async (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if (user.otp === req.body.otp) {
        user.is_Active = true;
        user.save();
        res.json({ msg: "You are successfully verified to use this app" });
      } else {
        res.json({ msg: "Please enter a valid otp" });
      }
    });
  });

  router.post("/login", async (req, res, next) => {
    try {
      const {
        user: { email = "", password = "" },
      } = req.body;

      User.aggregate([
        {
          $match: {
            $or: [{ email }],
          },
        },
      ]).then((LoggedInUser) => {
        if (size(LoggedInUser) > 0) {
          LoggedInUser = first(LoggedInUser);

          comparePass(password, res, LoggedInUser.password, async (results) => {
            let response = { error: "Invalid username or password" };
            if (results) {
              let token = await getJwtoken(req, omit(LoggedInUser, "password"));
              response = { token };
            }
            res.json({ data: response, message: "Log In Successfully" });
          });
        } else {
          res.json({ error: "Invalid username or password" });
        }
      });
    } catch (error) {
      res.status(500).send({ error: "Invalid username or password" });
    }
  });

  return router;
};

module.exports = routes;
