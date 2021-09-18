// This Model is User Model

import mongoose from "mongoose";

//Create Schema  like this below

//Lets Go back to Controller
const Schema = mongoose.Schema;
const hotels = new Schema(
  {
    name: { type: String },
    location: { type: String },
    image: { type: String },
    createdBy: { type: mongoose.Schema.ObjectId },
  },
  { timestamps: true }
);

//testData is my Collection Name
export default mongoose.models.hotels || mongoose.model("hotels", hotels);
