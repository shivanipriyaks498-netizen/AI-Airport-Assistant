
import "dotenv/config";
import mongoose from "mongoose";
import AirportLocation from "./models/AirportLocation.js";

const airports = [
  {
    airportCode: "BOM",
    airportName: "Chhatrapati Shivaji Maharaj International Airport"
  },
  {
    airportCode: "BLR",
    airportName: "Kempegowda International Airport"
  },
  {
    airportCode: "DEL",
    airportName: "Indira Gandhi International Airport"
  },
  {
    airportCode: "HYD",
    airportName: "Rajiv Gandhi International Airport"
  },
  {
    airportCode: "MAA",
    airportName: "Chennai International Airport"
  }
];

const categories = [
  "Check-in",
  "Security",
  "Boarding Gate",
  "Baggage Claim",
  "Restroom",
  "Restaurant",
  "ATM",
  "Information Desk",
  "Medical",
  "Parking"
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully!");

    const operations = [];

    for (const airport of airports) {
      for (const category of categories) {
        const facilityName = `${category} - Demonstration`;

        const facility = {
          airportCode: airport.airportCode,
          airportName: airport.airportName,
          facilityName,
          category,
          terminal: "Not specified",
          floor: "Not specified",
          area: "Demonstration data",
          directions:
            "This is demonstration data. Please confirm the actual facility location and directions with airport staff.",
          landmark: "",
          isDemo: true
        };

        operations.push({
          updateOne: {
            filter: {
              airportCode: airport.airportCode,
              facilityName
            },
            update: {
              $set: facility
            },
            upsert: true
          }
        });
      }
    }

    const result = await AirportLocation.bulkWrite(operations);

    console.log("Airport facility data added successfully!");
    console.log("Airports:", airports.length);
    console.log("Categories per airport:", categories.length);
    console.log("Total demonstration facilities:", operations.length);
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);

  } catch (error) {
    console.error("Seed Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  }
};

seedDatabase();
