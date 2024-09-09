import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/black-scholes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const {
        stock,
        startDate,
        endDate,
        strikePrice,
        timeToMaturity,
        riskFreeRate,
        minSpotPrice,
        maxSpotPrice,
      } = req.body;
      console.log("Sending request to FastAPI:", API_URL);
      console.log("Request body:", {
        stock,
        startDate,
        endDate,
        strikePrice,
        timeToMaturity,
        riskFreeRate,
        minSpotPrice,
        maxSpotPrice,
      });

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock,
          startDate,
          endDate,
          strikePrice,
          timeToMaturity,
          riskFreeRate,
          minSpotPrice,
          maxSpotPrice,
        }),
      });

      console.log("FastAPI response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FastAPI error: ${response.status} ${errorText}`);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received data from FastAPI:", data);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the request." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
