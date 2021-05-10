const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const friendshipSchema = Schema(
  {
    from: { type: Schema.ObjectId, required: true, ref: "User" },
    to: { type: Schema.ObjectId, required: true, ref: "User" },
    status: {
      type: String,
      enum: ["requesting", "accepted", "decline", "removed", "cancel"],
    },
  },
  { timestamps: true }
);

const Friendship = mongoose.model("Friendship", friendshipSchema);
module.exports = Friendship;