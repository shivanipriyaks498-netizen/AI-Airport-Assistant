
import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airline: {
      type: String,
      required: true,
      trim: true
    },

    flightNumber: {
      type: String,
      required: true,
      trim: true
    },

    from: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    to: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    date: {
      type: Date,
      required: true
    },

    departureTime: {
      type: String,
      required: true
    },

    arrivalTime: {
      type: String,
      required: true
    },

    terminal: {
      type: String,
      default: "To be announced"
    },

    gate: {
      type: String,
      default: "To be announced"
    },

    status: {
      type: String,
      enum: [
        "Scheduled",
        "Boarding",
        "Delayed",
        "Departed",
        "Arrived",
        "Cancelled"
      ],
      default: "Scheduled"
    },

    price: {
      type: Number,
      default: 0
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

// Prevent duplicate flight records for the same date
flightSchema.index(
  { flightNumber: 1, date: 1 },
  { unique: true }
);

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
