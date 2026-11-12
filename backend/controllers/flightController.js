
import Flight from "../models/Flight.js";

// =================================
// SEARCH FLIGHTS (PUBLIC)
// =================================

export const searchFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const searchQuery = {};

    if (from) {
      searchQuery.from = from.trim().toUpperCase();
    }

    if (to) {
      searchQuery.to = to.trim().toUpperCase();
    }

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

    const flights = await Flight.find(searchQuery)
      .sort({ departureTime: 1 });

    return res.status(200).json({
      success: true,
      count: flights.length,
      message: flights.length
        ? "Flights found successfully"
        : "No flights found",
      flights
    });

  } catch (error) {
    console.error("Flight search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search flights"
    });
  }
};

// =================================
// GET SINGLE FLIGHT (PUBLIC)
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

    return res.status(200).json({
      success: true,
      flight
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve flight"
    });
  }
};

// =================================
// ADD FLIGHT (ADMIN)
// =================================

export const addFlight = async (req, res) => {
  try {
    const {
      airline,
      flightNumber,
      from,
      to,
      date,
      departureTime,
      arrivalTime,
      terminal,
      gate,
      status,
      price
    } = req.body;

    if (
      !airline ||
      !flightNumber ||
      !from ||
      !to ||
      !date ||
      !departureTime ||
      !arrivalTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required flight fields"
      });
    }

    const flight = await Flight.create({
      airline,
      flightNumber,
      from,
      to,
      date,
      departureTime,
      arrivalTime,
      terminal,
      gate,
      status,
      price
    });

    return res.status(201).json({
      success: true,
      message: "Flight added successfully",
      flight
    });

  } catch (error) {
    console.error("Add flight error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This flight number already exists for this date"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add flight"
    });
  }
};

// =================================
// UPDATE FLIGHT (ADMIN)
// =================================

export const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      flight
    });

  } catch (error) {
    console.error("Update flight error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This flight number already exists for this date"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update flight"
    });
  }
};

// =================================
// DELETE FLIGHT (ADMIN)
// =================================

export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight deleted successfully"
    });

  } catch (error) {
    console.error("Delete flight error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete flight"
    });
  }
};
