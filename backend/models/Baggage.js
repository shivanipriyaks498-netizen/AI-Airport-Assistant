import mongoose from "mongoose";

const baggageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    trackingCode: {
      type: String,
      required: true,
      unique: true
    },

    passengerName: {
      type: String,
      required: true,
      trim: true
    },

    bookingReference: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    baggageTag: {
      type: String,
      required: true,
      trim: true
    },

    issueType: {
      type: String,
      required: true,
      enum: ["Lost", "Delayed", "Damaged", "Missing Items"]
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    airportCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    flightNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Located",
        "In Transit",
        "Ready for Collection",
        "Resolved"
      ],
      default: "Submitted"
    }
  },
  { timestamps: true }
);

baggageSchema.index({ user: 1, createdAt: -1 });

const Baggage = mongoose.model("Baggage", baggageSchema);

export default Baggage;