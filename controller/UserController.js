var express = require("express");
var router = express.Router();
import { ObjectId } from "mongoose";
import {
  DBConnection,
  authError,
  EncryptPass,
  comparePass,
  getJwtoken,
  authenticate,
  removeEmpty,
} from "../middleware";
import first from "lodash/first";
import omit from "lodash/omit";
import User from "../model/User";

router.use(authenticate, DBConnection, authError);
router.use(removeEmpty);

router.use("/id/:id", (req, res, next) => {
  const {
    params: { id },
  } = req;
  User.findById(ObjectId(id), (err, user) => {
    if (err) res.status(500).send(err);
    else {
      req.user = user;
      next();
    }
  });
});

var routes = () => {
  //: GET ALL
  router.get("/", async (req, res) => {
    try {
      User.find({}, function (err, users) {
        res.send({ data: users });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error });
    }
  });

  router.route("/id/:id").delete(async (req, res) => {
    try {
      User.findByIdAndRemove(req.params.id, (err, todo) => {
        if (err) return res.status(500).send(err);
        return res.status(200).json({
          meta: { message: "Records has been delete successfully!" },
        });
      });
    } catch (error) {}
  });

  return router;
};

module.exports = routes;
