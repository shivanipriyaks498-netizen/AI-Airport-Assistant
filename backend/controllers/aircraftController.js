
import { getLiveAircraft } from "../services/openSkyService.js";

export const fetchAircraft = async (req, res) => {
  try {
    const { lamin, lomin, lamax, lomax } = req.query;

    const bounds = {
      lamin: Number(lamin),
      lomin: Number(lomin),
      lamax: Number(lamax),
      lomax: Number(lomax)
    };

    // Check that all four coordinates are provided
    if (
      !lamin || !lomin || !lamax || !lomax ||
      !Object.values(bounds).every(Number.isFinite)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide lamin, lomin, lamax and lomax."
      });
    }

    // Validate latitude and longitude
    if (
      bounds.lamin < -90 || bounds.lamax > 90 ||
      bounds.lamin >= bounds.lamax ||
      bounds.lomin < -180 || bounds.lomax > 180 ||
      bounds.lomin >= bounds.lomax
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid geographical coordinates."
      });
    }

    const result = await getLiveAircraft(bounds);

    return res.status(200).json({
      success: true,
      message: "Live aircraft data retrieved successfully",
      ...result
    });

  } catch (error) {
    console.error("Live aircraft controller error:", error);

    return res.status(502).json({
      success: false,
      message: "Unable to retrieve live aircraft data"
    });
  }
};
