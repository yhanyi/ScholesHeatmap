"use client";

import BlackScholesHeatmap from "@/components/BlackScholesHeatmap";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <div>
      <TopBar />
      <BlackScholesHeatmap />
    </div>
  );
}
