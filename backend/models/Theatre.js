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
        "https://lh3.googleusercontent.com/gg-dl/AOI_d_9aZfFDuYqMaYPmRYEkVQyd06VrEdwvBERCP0wzJD8BYimxIHS8AXHIqDYVAHrOX4DQS5FftUo6yVVcBSuGsnAxyddqHeiYE6FM3lxfMGeE7HUA5jh2kuhfCTKcwUY2ab2NuUQh9gzSmjFRkUPrKXM-HBKSyyPgRoXtRm1s9d27Wvb-=s1600-rj",
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Theatre", TheatreSchema);