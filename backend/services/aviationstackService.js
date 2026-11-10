
const AVIATIONSTACK_URL = "http://api.aviationstack.com/v1/flights";

// Search real-time flight information.
export const searchFlights = async ({
  flightNumber,
  departure,
  arrival
}) => {
  const accessKey = process.env.AVIATIONSTACK_ACCESS_KEY;

  if (!accessKey) {
    throw new Error("Aviationstack API key is missing in backend .env");
  }

  const params = new URLSearchParams({
    access_key: accessKey,
    limit: "20"
  });

  // Add search filters only when provided.
  if (flightNumber) {
    params.append("flight_number", flightNumber);
  }

  if (departure) {
    params.append("dep_iata", departure.toUpperCase());
  }

  if (arrival) {
    params.append("arr_iata", arrival.toUpperCase());
  }

  const response = await fetch(
    `${AVIATIONSTACK_URL}?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message || "Aviationstack API request failed"
    );
  }

  return {
    pagination: data.pagination,
    flights: data.data || []
  };
};
