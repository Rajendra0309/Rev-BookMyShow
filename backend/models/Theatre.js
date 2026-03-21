const mongoose = require("mongoose");
const TheatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    city: { type: String },
    imageUrl: {
      type: String,
      trim: true,
      default:
        "https://www.ronakautomation.com/uploads/product/pic/no-photos.jpg",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Theatre", TheatreSchema);