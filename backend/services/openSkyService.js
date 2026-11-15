
const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

const OPENSKY_API = "https://opensky-network.org/api";

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("OpenSky credentials are missing in Render environment variables.");
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
    body,
    signal: AbortSignal.timeout(15000)
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenSky authentication failed (${response.status}): ${responseText.slice(0, 500)}`
    );
  }

  const data = JSON.parse(responseText);

  if (!data.access_token) {
    throw new Error("OpenSky authentication response did not contain an access token.");
  }

  cachedToken = data.access_token;
  tokenExpiresAt =
    Date.now() + (Math.max(60, (data.expires_in || 1800) - 60) * 1000);

  return cachedToken;
};

export const getLiveAircraft = async (bounds) => {
  const params = new URLSearchParams({
    lamin: String(bounds.lamin),
    lomin: String(bounds.lomin),
    lamax: String(bounds.lamax),
    lomax: String(bounds.lomax)
  });

  // Retry once if the access token has expired.
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getAccessToken();

    const response = await fetch(
      `${OPENSKY_API}/states/all?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(20000)
      }
    );

    if (response.status === 401 && attempt === 0) {
      cachedToken = null;
      tokenExpiresAt = 0;
      continue;
    }

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `OpenSky aircraft API failed (${response.status}): ${responseText.slice(0, 500)}`
      );
    }

    const data = JSON.parse(responseText);

    const aircraft = (data.states || [])
      .filter(state => state[5] !== null && state[6] !== null)
      .map(state => ({
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
      aircraft,
      rateLimitRemaining: response.headers.get("x-rate-limit-remaining"),
      rateLimitReset: response.headers.get("x-rate-limit-reset")
    };
  }

  throw new Error("OpenSky authentication failed after refreshing the token.");
};
