
import { getLiveAircraft } from "../services/openSkyService.js";

export const fetchAircraft = async (req, res) => {
  try {
    const { lamin, lomin, lamax, lomax } = req.query;

    // Convert coordinates into numbers
    const bounds = {
      lamin: Number(lamin),
      lomin: Number(lomin),
      lamax: Number(lamax),
      lomax: Number(lomax)
    };

    // Check that all coordinates are provided
    if (
      [lamin, lomin, lamax, lomax].some(
        value => value === undefined || value === ""
      ) ||
      !Object.values(bounds).every(Number.isFinite)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide lamin, lomin, lamax and lomax."
      });
    }

    // Validate latitude and longitude
    if (
      bounds.lamin < -90 ||
      bounds.lamax > 90 ||
      bounds.lamin >= bounds.lamax ||
      bounds.lomin < -180 ||
      bounds.lomax > 180 ||
      bounds.lomin >= bounds.lomax
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid geographical coordinates."
      });
    }

    // Get live aircraft data
    const result = await getLiveAircraft(bounds);

    return res.status(200).json({
      success: true,
      message: "Live aircraft data retrieved successfully",
      ...result
    });

  } catch (error) {

    // Detailed error information for Render logs
    console.error("Live aircraft controller error:", {
      message: error.message,
      cause: error.cause?.message,
      code: error.cause?.code,
      hostname: error.cause?.hostname,
      stack: error.stack
    });

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve live aircraft data",
      error: error.cause?.code || error.message
    });
  }
};
