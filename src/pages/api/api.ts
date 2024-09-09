export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://scholes-map.vercel.app/api/black-scholes"
    : "http://localhost:8080/api/black-scholes";
