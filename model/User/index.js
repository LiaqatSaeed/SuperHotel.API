// This Model is User Model

import mongoose from "mongoose";

//Create Schema  like this below

//Lets Go back to Controller
const Schema = mongoose.Schema;
const users = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    name: { type: String },
    password: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

//testData is my Collection Name
export default mongoose.models.users || mongoose.model("users", users);
