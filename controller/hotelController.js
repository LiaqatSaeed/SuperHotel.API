var express = require("express");
var router = express.Router();
import mongoose from "mongoose";

import {
  DBConnection,
  authError,
  authenticate,
  removeEmpty,
} from "../middleware";

import Hotel from "../Model/Hotel";

router.use(DBConnection, authError);
router.use(removeEmpty);

router.use("/id/:id", (req, res, next) => {
  const {
    params: { id },
  } = req;
  Hotel.findById(mongoose.Types.ObjectId(id), (err, user) => {
    if (err) res.status(500).send(err);
    else {
      req.hotel = user;
      next();
    }
  });
});

var routes = () => {
  router.post("/", authenticate, async (req, res) => {
    try {
      const { hotel } = req.body;
      hotel.createdBy = req.userModel._id;
      var HotelObj = new Hotel(hotel);
      HotelObj.save((err, newHotel) => {
        if (err) throw err;

        res.json({
          data: newHotel,
          meta: { message: "Hotel has been created!" },
        });
      });
    } catch (error) {
      res.status(500).send({ error });
    }
  });

  //: GET ALL
  router.get("/", async (req, res) => {
    try {
      let { query = {} } = req;
      Hotel.find(query, function (err, hotels) {
        res.send({ data: hotels });
      });
    } catch (error) {
      res.send(error);
    }
  });

  router
    .route("/id/:id")
    //: GET
    .get((req, res) => {
      res.json({ data: req.hotel });
    })
    //: GET PUT

    .put(authenticate, async (req, res, next) => {
      const { hotel } = req.body;
      Hotel.updateOne({ _id: req.params.id }, hotel, function (err, result) {
        if (err) {
          res.status(500).send({ error: err, msg: "user Update error" });
        } else {
          res.json({ data: hotel, meta: { message: "Updated Successfully" } });
        }
      }).catch((err) => {
        res.status(500).send({ error: error, msg: "user Update 1" });
      });
    })
    //: PATCH

    .patch(authenticate, (req, res) => {
      Hotel.update({ _id: req.params.id }, req.body)
        .then((result) => {
          res.json({ data: result });
        })
        .catch((err) => {
          res.status(500).send(error);
        });
    })
    //: DELETE

    .delete(authenticate, async (req, res) => {
      try {
        Hotel.findByIdAndRemove(req.params.id, (err, todo) => {
          if (err) return res.status(500).send(err);
          const response = {
            message: "Todo successfully deleted",
            id: todo._id,
          };
          return res.status(200).json({
            meta: { message: "Records has been delete successfully!" },
          });
        });
      } catch (error) {}
    });

  return router;
};

module.exports = routes;
