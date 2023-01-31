const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a product name "],
      trim: true,
      maxlength: [
        120,
        "Collection Name should not be more than 120 characters",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);


