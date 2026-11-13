
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const airportFilePath = path.join(
  __dirname,
  "../data/airports.csv"
);

let airports = [];

export const loadAirports = () => {
  return new Promise((resolve, reject) => {
    const airportList = [];

    fs.createReadStream(airportFilePath)
      .pipe(csv())
      .on("data", (row) => {
        if (
          row.iata_code &&
          /^[A-Z]{3}$/i.test(row.iata_code)
        ) {
          airportList.push({
            name: row.name || "",
            city: row.municipality || "",
            country: row.iso_country || "",
            iataCode: row.iata_code.toUpperCase(),
            latitude: row.latitude_deg,
            longitude: row.longitude_deg,

            // Additional information for ranking results.
            type: row.type || "",
            scheduledService: row.scheduled_service || "no"
          });
        }
      })
      .on("end", () => {
        airports = airportList;

        console.log(
          `Worldwide airports loaded: ${airports.length}`
        );

        resolve(airports.length);
      })
      .on("error", reject);
  });
};

export const searchAirports = (search) => {
  const query = search.trim().toLowerCase();

  if (!query) return [];

  const results = airports.filter((airport) =>
    airport.name.toLowerCase().includes(query) ||
    airport.city.toLowerCase().includes(query) ||
    airport.country.toLowerCase().includes(query) ||
    airport.iataCode.toLowerCase().includes(query)
  );

  const getAirportScore = (airport) => {
    let score = 0;

    // Exact airport-code match.
    if (airport.iataCode.toLowerCase() === query) {
      score += 1000;
    }

    // Exact airport-name match.
    if (airport.name.toLowerCase() === query) {
      score += 800;
    }

    // Exact city match.
    if (airport.city.toLowerCase() === query) {
      score += 600;
    }

    // Prefer major airports.
    if (airport.type === "large_airport") {
      score += 100;
    } else if (airport.type === "medium_airport") {
      score += 50;
    }

    // Prefer airports with scheduled passenger service.
    if (airport.scheduledService.toLowerCase() === "yes") {
      score += 75;
    }

    return score;
  };

  return results
    .sort((a, b) => getAirportScore(b) - getAirportScore(a))
    .slice(0, 20);
};

// Find airports near the user's GPS location
export const searchNearbyAirports = (
  latitude,
  longitude,
  radiusKm = 150
) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  return airports
    .map((airport) => {
      const airportLatitude = Number(airport.latitude);
      const airportLongitude = Number(airport.longitude);

      if (
        !Number.isFinite(airportLatitude) ||
        !Number.isFinite(airportLongitude)
      ) {
        return null;
      }

      const distanceKm = calculateDistance(
        latitude,
        longitude,
        airportLatitude,
        airportLongitude
      );

      return {
        ...airport,
        distanceKm: Number(distanceKm.toFixed(2))
      };
    })
    .filter(
      (airport) =>
        airport !== null &&
        airport.distanceKm <= radiusKm
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);
};