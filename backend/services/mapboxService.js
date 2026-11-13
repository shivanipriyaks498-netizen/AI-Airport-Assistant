
const MAPBOX_URL = "https://api.mapbox.com/v4/mapbox.indoor-v3";

const INDOOR_LAYERS = [
  "indoor_structure",
  "indoor_floor",
  "indoor_floorplan",
  "indoor_door",
  "indoor_label",
  "indoor_facility_metadata",
  "indoor_structure_metadata",
  "indoor_floor_metadata",
];

export const getMapboxIndoorData = async ({
  longitude,
  latitude,
  radius = 500,
}) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!token) {
    throw new Error("MAPBOX_ACCESS_TOKEN is missing");
  }

  const params = new URLSearchParams({
    radius: String(radius),
    limit: "50",
    layers: INDOOR_LAYERS.join(","),
    access_token: token,
  });

  const url =
    `${MAPBOX_URL}/tilequery/${longitude},${latitude}.json?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mapbox API error: ${error}`);
  }

  const data = await response.json();

  return data.features || [];
};
