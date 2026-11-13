
import {
  searchAirports,
  searchNearbyAirports
} from "../services/airportService.js";

// Search airports by name, city or IATA code
export const getAirports = (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter an airport name, city or airport code."
      });
    }

    const results = searchAirports(search);

    return res.status(200).json({
      success: true,
      totalAirports: results.length,
      airports: results
    });
  } catch (error) {
    console.error("Airport search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search airports."
    });
  }
};

// Find airports near the user's GPS location
export const getNearbyAirports = (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Number(req.query.radiusKm || 150);

    if (
      req.query.latitude === undefined ||
      req.query.longitude === undefined ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid GPS latitude and longitude."
      });
    }

    if (
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Search radius must be between 1 and 500 km."
      });
    }

    const airports = searchNearbyAirports(
      latitude,
      longitude,
      radiusKm
    );

    return res.status(200).json({
      success: true,
      totalAirports: airports.length,
      airports
    });
  } catch (error) {
    console.error("Nearby airport search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to find nearby airports."
    });
  }
};
