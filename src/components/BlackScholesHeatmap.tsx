import React, { useState, useEffect } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import InputFields from "./InputFields";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/black-scholes";

interface HeatmapData {
  id: string;
  [key: string]: string | number;
}

interface BlackScholesData {
  callData: HeatmapData[];
  putData: HeatmapData[];
  stockPrice: number;
  impliedVolatility: number;
  strikePrice: number;
  timeToMaturity: number;
  riskFreeRate: number;
}

export default function BlackScholesHeatmap() {
  const [stock, setStock] = useState("AAPL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [strikePrice, setStrikePrice] = useState<number | null>(null);
  const [timeToMaturity, setTimeToMaturity] = useState(1);
  const [riskFreeRate, setRiskFreeRate] = useState(0.01);
  const [minSpotPrice, setMinSpotPrice] = useState<number | null>(null);
  const [maxSpotPrice, setMaxSpotPrice] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<BlackScholesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(oneMonthAgo.toISOString().split("T")[0]);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setProgress("Fetching data...");
    try {
      console.log("Fetching data from API...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data: BlackScholesData = await response.json();
      console.log("Received data:", data);
      setHeatmapData(data);
      setProgress("Data fetched successfully.");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setProgress("Error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatHeatmapData = (
    data: HeatmapData[]
  ): { id: string; data: { x: string; y: number }[] }[] => {
    console.log("Formatting heatmap data:", data);
    const formatted = data.map((row) => ({
      id: row.id,
      data: Object.entries(row)
        .filter(([key]) => key !== "id")
        .map(([key, value]) => ({
          x: key,
          y: typeof value === "number" ? value : parseFloat(value),
        })),
    }));
    console.log("Formatted heatmap data:", formatted);
    return formatted;
  };

  const renderHeatmap = (data: HeatmapData[], title: string) => {
    if (!data || data.length === 0) {
      return <div>No data available for {title}</div>;
    }
    return (
      <div className="p-15 w-[1000px] h-[1000px]">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <ResponsiveHeatMap
          data={formatHeatmapData(data)}
          margin={{ top: 120, right: 120, bottom: 120, left: 120 }}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Volatility",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          axisRight={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -90,
            legend: "Strike Price",
            legendPosition: "middle",
            legendOffset: -50,
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Spot Price",
            legendPosition: "middle",
            legendOffset: 50,
          }}
          colors={{
            type: "sequential",
            scheme: "blue_green",
          }}
          emptyColor="#555555"
          legends={[
            {
              anchor: "bottom",
              translateX: 0,
              translateY: 80,
              length: 400,
              thickness: 8,
              direction: "row",
              tickPosition: "after",
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              title: "Option Price",
              titleAlign: "start",
              titleOffset: 4,
            },
          ]}
        />
      </div>
    );
  };

  return (
    <div className="w-full p-4 flex flex-col md:flex-row">
      <div className="flex flex-col items-center">
        <InputFields
          stock={stock}
          setStock={setStock}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          strikePrice={strikePrice}
          setStrikePrice={setStrikePrice}
          timeToMaturity={timeToMaturity}
          setTimeToMaturity={setTimeToMaturity}
          riskFreeRate={riskFreeRate}
          setRiskFreeRate={setRiskFreeRate}
          minSpotPrice={minSpotPrice}
          setMinSpotPrice={setMinSpotPrice}
          maxSpotPrice={maxSpotPrice}
          setMaxSpotPrice={setMaxSpotPrice}
          fetchData={fetchData}
          loading={loading}
        />
        {progress && <div className="mb-4">{progress}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {heatmapData && (
          <div className="py-4">
            <p>
              Current Stock Price: $
              {heatmapData.stockPrice?.toFixed(2) ?? "N/A"}
            </p>
            <p>
              Implied Volatility:{" "}
              {heatmapData.impliedVolatility != null
                ? `${(heatmapData.impliedVolatility * 100).toFixed(2)}%`
                : "N/A"}
            </p>
            <p>Strike Price: ${heatmapData.strikePrice?.toFixed(2) ?? "N/A"}</p>
            <p>
              Time to Maturity:{" "}
              {heatmapData.timeToMaturity?.toFixed(2) ?? "N/A"} years
            </p>
            <p>
              Risk-Free Rate:{" "}
              {heatmapData.riskFreeRate != null
                ? `${(heatmapData.riskFreeRate * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
        )}
      </div>
      <div>
        {heatmapData && (
          <div className="flex flex-col gap-5">
            {renderHeatmap(heatmapData.callData, "Call Option Prices")}
            {renderHeatmap(heatmapData.putData, "Put Option Prices")}
          </div>
        )}
      </div>
    </div>
  );
}
