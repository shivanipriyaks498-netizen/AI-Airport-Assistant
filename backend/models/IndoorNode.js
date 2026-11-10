
import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true
    },

    distance: {
      type: Number,
      required: true,
      min: 0
    },

    instruction: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const indoorNodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    airportCode: {
      type: String,
      required: true,
      uppercase: true
    },

    terminal: {
      type: String,
      required: true,
      enum: ["T1", "T2"]
    },

    floor: {
      type: String,
      required: true,
      enum: [
        "Ground Floor",
        "First Floor",
        "Second Floor"
      ]
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    connections: {
      type: [connectionSchema],
      default: []
    },

    isDemo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

indoorNodeSchema.index({
  airportCode: 1,
  terminal: 1,
  floor: 1
});

const IndoorNode = mongoose.model(
  "IndoorNode",
  indoorNodeSchema
);

export default IndoorNode;
