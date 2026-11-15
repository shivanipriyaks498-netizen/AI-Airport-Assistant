
import mongoose from "mongoose";

const indoorNodeSchema = new mongoose.Schema(
  {
    nodeId: {
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

    terminal: {
      type: String,
      required: true
    },

    floor: {
      type: String,
      required: true
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
      required: true
    },

    y: {
      type: Number,
      required: true
    },

    connections: [
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
          default: ""
        }
      }
    ],

    isDemo: {
      type: Boolean,
      default: true
    },

    dataSource: {
      type: String,
      default: "demo"
    }
  },
  {
    timestamps: true
  }
);

indoorNodeSchema.index(
  { airportCode: 1, terminal: 1, nodeId: 1 },
  { unique: true }
);

const IndoorNode = mongoose.model(
  "IndoorNode",
  indoorNodeSchema
);

export default IndoorNode;
