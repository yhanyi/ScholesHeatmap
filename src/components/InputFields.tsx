import React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface InputFieldsProps {
  stock: string;
  setStock: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  strikePrice: number | null;
  setStrikePrice: (value: number | null) => void;
  timeToMaturity: number;
  setTimeToMaturity: (value: number) => void;
  riskFreeRate: number;
  setRiskFreeRate: (value: number) => void;
  minSpotPrice: number | null;
  setMinSpotPrice: (value: number | null) => void;
  maxSpotPrice: number | null;
  setMaxSpotPrice: (value: number | null) => void;
  fetchData: () => void;
  loading: boolean;
}

export default function InputFields({
  stock,
  setStock,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  strikePrice,
  setStrikePrice,
  timeToMaturity,
  setTimeToMaturity,
  riskFreeRate,
  setRiskFreeRate,
  minSpotPrice,
  setMinSpotPrice,
  maxSpotPrice,
  setMaxSpotPrice,
  fetchData,
  loading,
}: InputFieldsProps) {
  return (
    <div className="w-64 p-6 pt-20 flex flex-col gap-10">
      <h2 className="text-xl font-bold mb-4">Parameters</h2>
      <div className="gap-4">
        <Input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock Symbol"
          label="Stock Symbol"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          label="Start Date"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          label="End Date"
        />
        <Input
          type="number"
          value={strikePrice !== null ? strikePrice : ""}
          onChange={(e) =>
            setStrikePrice(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="Strike Price"
          label="Strike Price"
        />
        <Input
          type="number"
          value={timeToMaturity}
          onChange={(e) => setTimeToMaturity(Number(e.target.value))}
          placeholder="Time to Maturity (Years)"
          label="Time to Maturity (Years)"
        />
        <Input
          type="number"
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(Number(e.target.value))}
          placeholder="Risk-Free Rate"
          label="Risk-Free Rate"
          step="0.01"
        />
        <Input
          type="number"
          value={minSpotPrice !== null ? minSpotPrice : ""}
          onChange={(e) =>
            setMinSpotPrice(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="Min Spot Price"
          label="Min Spot Price"
        />
        <Input
          type="number"
          value={maxSpotPrice !== null ? maxSpotPrice : ""}
          onChange={(e) =>
            setMaxSpotPrice(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="Max Spot Price"
          label="Max Spot Price"
        />
      </div>
      <Button onClick={fetchData} disabled={loading}>
        {loading ? "Loading..." : "Update"}
      </Button>
    </div>
  );
}
