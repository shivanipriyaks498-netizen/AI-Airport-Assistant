import crypto from "crypto";
import Baggage from "../models/Baggage.js";

// Generate a unique baggage tracking code
const generateTrackingCode = () => {
  return "BAG-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Submit a new baggage complaint
const createBaggageReport = async (req, res) => {
  try {
    const {
      passengerName,
      bookingReference,
      baggageTag,
      issueType,
      description,
      airportCode,
      flightNumber
    } = req.body;

    if (
      !passengerName ||
      !bookingReference ||
      !baggageTag ||
      !issueType ||
      !description ||
      !airportCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    const userId = req.user._id || req.user.id;

    const baggageReport = await Baggage.create({
      user: userId,
      trackingCode: generateTrackingCode(),
      passengerName,
      bookingReference,
      baggageTag,
      issueType,
      description,
      airportCode,
      flightNumber: flightNumber || ""
    });

    res.status(201).json({
      success: true,
      message: "Baggage report submitted successfully",
      report: baggageReport
    });
  } catch (error) {
    console.error("Baggage report error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit baggage report"
    });
  }
};

// Get all reports belonging to the logged-in passenger
const getMyBaggageReports = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const reports = await Baggage.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Baggage history error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve baggage reports"
    });
  }
};

// Track one report belonging to the logged-in passenger
const trackBaggageReport = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const trackingCode = req.params.trackingCode.trim().toUpperCase();

    const report = await Baggage.findOne({
      trackingCode,
      user: userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Baggage report not found"
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error("Baggage tracking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to track baggage report"
    });
  }
};

export {
  createBaggageReport,
  getMyBaggageReports,
  trackBaggageReport
};