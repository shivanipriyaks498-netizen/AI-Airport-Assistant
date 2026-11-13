
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export const getOSMIndoorData = async ({
  longitude,
  latitude,
  radius = 500,
}) => {
  const query = `
    [out:json][timeout:25];
    (
      node(around:${radius},${latitude},${longitude})["indoor"];
      way(around:${radius},${latitude},${longitude})["indoor"];
      relation(around:${radius},${latitude},${longitude})["indoor"];

      node(around:${radius},${latitude},${longitude})["aeroway"="gate"];
      node(around:${radius},${latitude},${longitude})["amenity"~"toilets|restaurant|cafe"];
      node(around:${radius},${latitude},${longitude})["shop"];
    );
    out center tags;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ data: query }),
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap error: ${response.status}`);
  }

  const data = await response.json();

  return (data.elements || []).map((element) => ({
    id: element.id,
    osmType: element.type,
    name: element.tags?.name || "Unnamed feature",
    category:
      element.tags?.indoor ||
      element.tags?.aeroway ||
      element.tags?.amenity ||
      element.tags?.shop ||
      "indoor_feature",
    level: element.tags?.level || null,
    tags: element.tags || {},
    coordinates: element.lat && element.lon
      ? [element.lon, element.lat]
      : element.center
        ? [element.center.lon, element.center.lat]
        : null,
  }));
};
