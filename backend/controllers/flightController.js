
import Flight from "../models/Flight.js";

// =================================
// SEARCH FLIGHTS
// =================================

export const searchFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Build search query
    const searchQuery = {};

    if (from) {
      searchQuery.from = from.trim().toUpperCase();
    }

    if (to) {
      searchQuery.to = to.trim().toUpperCase();
    }

    // Search for flights on the selected date
    if (date) {
      const selectedDate = new Date(`${date}T00:00:00.000Z`);

      if (Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid travel date"
        });
      }

      const nextDate = new Date(selectedDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      searchQuery.date = {
        $gte: selectedDate,
        $lt: nextDate
      };
    }

    // Search MongoDB
    const flights = await Flight.find(searchQuery)
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: flights.length,
      message:
        flights.length > 0
          ? "Flights found successfully"
          : "No flights found",
      flights
    });

  } catch (error) {
    console.error("Flight search error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to search flights"
    });
  }
};

// =================================
// GET SINGLE FLIGHT
// =================================

export const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found"
      });
    }

    res.status(200).json({
      success: true,
      flight
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve flight"
    });
  }
};
