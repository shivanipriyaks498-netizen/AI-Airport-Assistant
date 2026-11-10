
const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

const OPENSKY_API =
  "https://opensky-network.org/api";

let cachedToken = null;
let tokenExpiresAt = 0;

// Get OpenSky access token
const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("OpenSky credentials are missing in backend .env");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`OpenSky authentication failed: ${response.status}`);
  }

  const data = await response.json();

  cachedToken = data.access_token;

  // Refresh token 60 seconds before expiry
  tokenExpiresAt =
    Date.now() + ((data.expires_in || 1800) - 60) * 1000;

  return cachedToken;
};

// Get live aircraft positions
export const getLiveAircraft = async ({
  lamin,
  lomin,
  lamax,
  lomax
}) => {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    lamin: String(lamin),
    lomin: String(lomin),
    lamax: String(lamax),
    lomax: String(lomax)
  });

  const response = await fetch(
    `${OPENSKY_API}/states/all?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`OpenSky aircraft request failed: ${response.status}`);
  }

  const data = await response.json();

  const aircraft = (data.states || [])
    .filter((state) => state[5] !== null && state[6] !== null)
    .map((state) => ({
      icao24: state[0],
      callsign: state[1]?.trim() || "Unknown",
      originCountry: state[2],
      longitude: state[5],
      latitude: state[6],
      altitude: state[7],
      onGround: state[8],
      velocity: state[9],
      heading: state[10],
      verticalRate: state[11],
      lastContact: state[4]
    }));

  return {
    time: data.time,
    count: aircraft.length,
    aircraft
  };
};
