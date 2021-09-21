import jsonwebtoken from "jsonwebtoken";
import isNil from "lodash/isNil";
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
import split from "lodash/split";
import nth from "lodash/nth";
import isEmpty from "lodash/isEmpty";

const { SECRET_KEY = "@secretKey", EXPIRED_AFTER = 0, DB } = process.env;

const mongoDB = DB;
const secretKey = SECRET_KEY;
const expiredAfter = parseInt(EXPIRED_AFTER);

const authenticate = (req, res, next) => {
  const {
    headers: { authorization },
  } = req;
  const token = !isNil(authorization)
    ? nth(split(authorization, " "), 1) || ""
    : "";
  !isEmpty(token)
    ? jsonwebtoken.verify(token, secretKey, (error, decoded) => {
        if (error) {
          next({ error: "token varified failed" });
        } else {
          const { expiredAt, context } = decoded;

          if (expiredAt > new Date().getTime()) {
            req.userModel = context;
            next();
          } else {
            next({ error: "token expired" });
          }
        }
      })
    : req.userModel === undefined
    ? next({ error: "Please Provide a valid token" })
    : next();
};

const authError = (err, req, res, next) => {
  res.status(500).send(err);
};

const MongoConnect = (callback) => {
  mongoose.connect(
    mongoDB,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err, db) => callback(err, db)
  );
};

const DBConnection = async (req, res, next) => {
  MongoConnect((err, db) => {
    if (err) next({ error: "DB Connection error", status: 505 });

    console.log("Connected ........");
    req.db = db;
    next();
  });
};

const sendSms = async (req, res, next) => {
  req.sendSms = client;
  next();
};

const EncryptPass = async (req, res, next) => {
  let { user } = req.body;
  if (!isNil(user.password)) {
    bcrypt.hash(user.password, null, null, function (err, hash) {
      // Store hash in your password DB.
      if (err)
        next({
          error: "Something went wrong please contact your admin",
          status: 404,
        });

      user.password = hash;
      req.body.user = user;
      next();
    });
  } else {
    next({
      error: "Something went wrong please contact your admin",
      status: 404,
    });
  }
};

const comparePass = async (password, res, usrObj, callback) => {
  bcrypt.compare(password, usrObj, function (err, result) {
    if (err) {
      res.json({ error: "invalid password", status: 200 });
    } else {
      callback(result);
    }
  });
};

const removeEmpty = (req, res, next) => {
  const { query } = req;
  Object.keys(query).map((key) => {
    if (query[key] === "") {
      delete query[key];
    }
    return query;
  });
  req.query = query;
  next();
};

const getJwtoken = async (req, context) => {
  return await jsonwebtoken.sign(
    {
      expiredAt: new Date().getTime() * expiredAfter,
      context,
      user_agent: req.get("user-agent") || "",
    },
    secretKey
  );
};

export {
  authenticate,
  authError,
  DBConnection,
  EncryptPass,
  sendSms,
  comparePass,
  getJwtoken,
  MongoConnect,
  removeEmpty,
  mongoose,
};
