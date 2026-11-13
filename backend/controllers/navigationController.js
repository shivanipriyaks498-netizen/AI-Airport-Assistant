
import AirportLocation from "../models/AirportLocation.js";

// ======================================
// GET AIRPORT LOCATIONS
// ======================================

export const getAirportLocations = async (req, res) => {
  try {
    const {
      airportCode,
      category,
      search,
      terminal
    } = req.query;

    const query = {};

    // Filter by airport code
    if (airportCode) {
      query.airportCode = airportCode.trim().toUpperCase();
    }

    // Filter by category
    if (category && category !== "All") {
      query.category = category;
    }

    // Filter by terminal
    if (terminal && terminal !== "All") {
      query.terminal = terminal;
    }

    // Search facility name, area or landmark
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        {
          facilityName: {
            $regex: safeSearch,
            $options: "i"
          }
        },
        {
          area: {
            $regex: safeSearch,
            $options: "i"
          }
        },
        {
          landmark: {
            $regex: safeSearch,
            $options: "i"
          }
        }
      ];
    }

    const locations = await AirportLocation.find(query)
      .sort({ category: 1, facilityName: 1 });

    return res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });

  } catch (error) {
    console.error("Navigation search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve airport locations",
      error: error.message
    });
  }
};

// ======================================
// GET SINGLE AIRPORT LOCATION
// ======================================

export const getAirportLocationById = async (req, res) => {
  try {
    const location = await AirportLocation.findById(
      req.params.id
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Airport location not found"
      });
    }

    return res.status(200).json({
      success: true,
      location
    });

  } catch (error) {
    console.error("Get location error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve location details",
      error: error.message
    });
  }
};
