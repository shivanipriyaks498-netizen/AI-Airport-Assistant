import "dotenv/config";
import mongoose from "mongoose";
import AirportLocation from "./models/AirportLocation.js";

const seedNavigation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB for navigation seeding");

    const locations = [
      // =========================
      // TERMINAL 1 FACILITIES
      // =========================
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Check-in Counter",
        category: "Check-in",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Departure Hall",
        directions: "Enter the departure hall and follow the check-in counter signs.",
        landmark: "Near the main entrance"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Security Check",
        category: "Security",
        terminal: "T1",
        floor: "First Floor",
        area: "Security Zone",
        directions: "Follow the departure signs to the security screening area.",
        landmark: "After the check-in area"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Boarding Gate A1",
        category: "Boarding Gate",
        terminal: "T1",
        floor: "First Floor",
        area: "Departure Lounge",
        directions: "Follow the departure gate signs to gate A1.",
        landmark: "Near the departure lounge"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Baggage Claim",
        category: "Baggage Claim",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Arrival Hall",
        directions: "Follow the baggage claim signs after arriving.",
        landmark: "Near the arrival exit"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Passenger Restroom",
        category: "Restroom",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Arrival Hall",
        directions: "Follow the restroom signs inside the terminal.",
        landmark: "Near the arrival hall"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Food Court",
        category: "Restaurant",
        terminal: "T1",
        floor: "First Floor",
        area: "Departure Lounge",
        directions: "Follow the food and dining signs inside the terminal.",
        landmark: "Near the departure lounge"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Airport ATM",
        category: "ATM",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Public Area",
        directions: "Follow the ATM or banking signs in the public area.",
        landmark: "Near the main entrance"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Information Desk",
        category: "Information Desk",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Departure Hall",
        directions: "Look for the airport information counter.",
        landmark: "Near the entrance"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Medical Assistance",
        category: "Medical",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Public Area",
        directions: "Ask airport staff to direct you to medical assistance.",
        landmark: "Ask at the information desk"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "Parking Area",
        category: "Parking",
        terminal: "T1",
        floor: "Ground Floor",
        area: "Outside Terminal",
        directions: "Follow the airport parking signs outside the terminal.",
        landmark: "Outside the terminal building"
      },

      // =========================
      // TERMINAL 2 FACILITIES
      // DEMONSTRATION RECORDS
      // =========================
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Check-in Counter",
        category: "Check-in",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Departure Hall",
        directions: "Demonstration direction: follow the check-in signs in the departure hall.",
        landmark: "Departure Hall"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Security Check",
        category: "Security",
        terminal: "T2",
        floor: "First Floor",
        area: "Security Zone",
        directions: "Demonstration direction: follow the security screening signs.",
        landmark: "Security Zone"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Boarding Gate",
        category: "Boarding Gate",
        terminal: "T2",
        floor: "First Floor",
        area: "Departure Lounge",
        directions: "Demonstration direction: follow the boarding gate signs.",
        landmark: "Departure Lounge"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Baggage Claim",
        category: "Baggage Claim",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Arrival Hall",
        directions: "Demonstration direction: follow the baggage claim signs.",
        landmark: "Arrival Hall"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Passenger Restroom",
        category: "Restroom",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Public Area",
        directions: "Demonstration direction: follow the restroom signs.",
        landmark: "Public Area"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Food Court",
        category: "Restaurant",
        terminal: "T2",
        floor: "Second Floor",
        area: "Food and Dining Area",
        directions: "Demonstration direction: follow the restaurant and dining signs.",
        landmark: "Food and Dining Area"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Airport ATM",
        category: "ATM",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Public Area",
        directions: "Demonstration direction: look for ATM and banking signs.",
        landmark: "Public Area"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Information Desk",
        category: "Information Desk",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Arrival Hall",
        directions: "Demonstration direction: look for the information desk signs.",
        landmark: "Arrival Hall"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Medical Assistance",
        category: "Medical",
        terminal: "T2",
        floor: "First Floor",
        area: "Public Area",
        directions: "Demonstration direction: ask airport staff for medical assistance.",
        landmark: "Public Area"
      },
      {
        airportCode: "BLR",
        airportName: "Bengaluru Airport",
        facilityName: "T2 Parking Area",
        category: "Parking",
        terminal: "T2",
        floor: "Ground Floor",
        area: "Outside Terminal",
        directions: "Demonstration direction: follow the parking signs outside the terminal.",
        landmark: "Outside the terminal building"
      }
    ];

    // Add or update records without creating duplicates.
    for (const location of locations) {
      await AirportLocation.updateOne(
        {
          airportCode: location.airportCode,
          facilityName: location.facilityName,
          terminal: location.terminal
        },
        {
          $set: {
            ...location,
            isDemo: true
          }
        },
        {
          upsert: true
        }
      );
    }

    console.log(`${locations.length} airport demo locations added or updated successfully!`);

  } catch (error) {
    console.error("Navigation seeding failed:", error.message);

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
};

seedNavigation();