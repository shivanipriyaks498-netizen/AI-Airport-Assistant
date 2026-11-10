
import { searchFlights } from "../services/aviationstackService.js";

export const getLiveFlights = async (req, res) => {
  try {
    const {
      flightNumber,
      departure,
      arrival
    } = req.query;

    // At least one search field is required.
    if (!flightNumber && !departure && !arrival) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a flight number, departure airport or arrival airport."
      });
    }

    // Validate airport codes.
    const airportCodePattern = /^[A-Za-z]{3}$/;

    if (
      (departure && !airportCodePattern.test(departure)) ||
      (arrival && !airportCodePattern.test(arrival))
    ) {
      return res.status(400).json({
        success: false,
        message: "Airport codes must contain exactly 3 letters, such as BLR or DEL."
      });
    }

    const result = await searchFlights({
      flightNumber: flightNumber?.trim(),
      departure: departure?.trim(),
      arrival: arrival?.trim()
    });

    return res.status(200).json({
      success: true,
      message: "Flight information retrieved successfully",
      totalFlights: result.flights.length,
      pagination: result.pagination,
      flights: result.flights
    });

  } catch (error) {
    console.error("Live flight search error:", error);

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve live flight information",
      error: error.message
    });
  }
};
