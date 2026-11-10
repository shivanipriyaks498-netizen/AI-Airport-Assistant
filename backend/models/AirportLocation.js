
import mongoose from "mongoose";

const airportLocationSchema = new mongoose.Schema(
  {
    airportCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    airportName: {
      type: String,
      required: true,
      trim: true
    },

    facilityName: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Check-in",
        "Security",
        "Boarding Gate",
        "Baggage Claim",
        "Restroom",
        "Restaurant",
        "ATM",
        "Information Desk",
        "Medical",
        "Parking",
        "Other"
      ]
    },

    terminal: {
      type: String,
      required: true
    },

    floor: {
      type: String,
      required: true
    },

    area: {
      type: String,
      required: true
    },

    directions: {
      type: String,
      required: true
    },

    landmark: {
      type: String,
      default: ""
    },

    isDemo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster airport facility searches
airportLocationSchema.index({
  airportCode: 1,
  category: 1
});

const AirportLocation = mongoose.model(
  "AirportLocation",
  airportLocationSchema
);

export default AirportLocation;
