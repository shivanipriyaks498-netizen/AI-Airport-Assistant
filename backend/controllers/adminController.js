import User from "../models/User.js";
import Flight from "../models/Flight.js";
import Baggage from "../models/Baggage.js";

// Dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    const totalPassengers = await User.countDocuments({
      role: { $ne: "admin" }
    });

    const totalFlights = await Flight.countDocuments();

    const totalBaggageReports = await Baggage.countDocuments();

    const pendingBaggageReports = await Baggage.countDocuments({
      status: { $in: ["Submitted", "Under Review"] }
    });

    const resolvedBaggageReports = await Baggage.countDocuments({
      status: "Resolved"
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPassengers,
        totalFlights,
        totalBaggageReports,
        pendingBaggageReports,
        resolvedBaggageReports
      }
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics"
    });
  }
};

// View registered passengers
export const getAllPassengers = async (req, res) => {
  try {
    const passengers = await User.find({
      role: { $ne: "admin" }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: passengers.length,
      passengers
    });
  } catch (error) {
    console.error("Passenger list error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve passengers"
    });
  }
};

// View all baggage complaints
export const getAllBaggageReports = async (req, res) => {
  try {
    const reports = await Baggage.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Admin baggage list error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve baggage reports"
    });
  }
};

// Update baggage complaint status
export const updateBaggageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "Located",
      "In Transit",
      "Ready for Collection",
      "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid baggage status"
      });
    }

    const report = await Baggage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Baggage report not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Baggage status updated successfully",
      report
    });
  } catch (error) {
    console.error("Baggage status update error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update baggage status"
    });
  }
};