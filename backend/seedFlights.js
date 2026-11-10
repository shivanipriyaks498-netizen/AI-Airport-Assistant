
import dotenv from "dotenv";
import mongoose from "mongoose";
import Flight from "./models/Flight.js";

dotenv.config();

const seedFlights = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database:", mongoose.connection.name);
    console.log("Connected to MongoDB for flight seeding");

    // Generate dates for tomorrow and the following days
    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const dayAfter = new Date(tomorrow);
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);

    const twoDaysAfter = new Date(tomorrow);
    twoDaysAfter.setUTCDate(twoDaysAfter.getUTCDate() + 2);

    console.log("Tomorrow's flight date:", tomorrow.toISOString().split("T")[0]);
    console.log("Following day's flight date:", dayAfter.toISOString().split("T")[0]);

    const flights = [
      {
        airline: "Air India",
        flightNumber: "AI 501",
        from: "BLR",
        to: "DEL",
        date: tomorrow,
        departureTime: "08:30",
        arrivalTime: "11:15",
        terminal: "T1",
        gate: "G12",
        status: "Scheduled",
        price: 5500,
        isDemo: true
      },
      {
        airline: "IndiGo",
        flightNumber: "6E 2134",
        from: "BLR",
        to: "DEL",
        date: tomorrow,
        departureTime: "10:45",
        arrivalTime: "13:30",
        terminal: "T1",
        gate: "G08",
        status: "Boarding",
        price: 4800,
        isDemo: true
      },
      {
        airline: "Air India Express",
        flightNumber: "IX 1024",
        from: "BLR",
        to: "DEL",
        date: tomorrow,
        departureTime: "14:20",
        arrivalTime: "17:05",
        terminal: "T2",
        gate: "G05",
        status: "Delayed",
        price: 5200,
        isDemo: true
      },
      {
        airline: "Akasa Air",
        flightNumber: "QP 1350",
        from: "BLR",
        to: "BOM",
        date: tomorrow,
        departureTime: "09:15",
        arrivalTime: "11:00",
        terminal: "T1",
        gate: "G14",
        status: "Scheduled",
        price: 3900,
        isDemo: true
      },
      {
        airline: "IndiGo",
        flightNumber: "6E 456",
        from: "DEL",
        to: "BLR",
        date: dayAfter,
        departureTime: "16:00",
        arrivalTime: "18:50",
        terminal: "T2",
        gate: "G21",
        status: "Scheduled",
        price: 5100,
        isDemo: true
      },
      {
        airline: "Air India",
        flightNumber: "AI 808",
        from: "BLR",
        to: "HYD",
        date: twoDaysAfter,
        departureTime: "07:40",
        arrivalTime: "08:55",
        terminal: "T1",
        gate: "G03",
        status: "Scheduled",
        price: 3200,
        isDemo: true
      }
    ];

    // Insert or update records without creating duplicates
    for (const flight of flights) {
      await Flight.updateOne(
        {
          flightNumber: flight.flightNumber,
          date: flight.date
        },
        {
          $set: flight
        },
        {
          upsert: true
        }
      );
    }

    console.log("Sample flights added successfully!");

  } catch (error) {
    console.error("Flight seeding failed:", error.message);

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
};

seedFlights();
