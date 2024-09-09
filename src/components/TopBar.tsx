import React from "react";

export default function TopBar() {
  return (
    <nav className="absolute top-0 left-0 bg-blue-600 p-4 text-white">
      <div className="container mx-auto">
        <h1 className="text-m font-bold">Black-Scholes Heatmap</h1>
        <div className="mt-2 flex justify-center">
          <a
            href="https://github.com/yhanyi/ScholesHeatmap"
            className="mr-4 hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://www.investopedia.com/terms/b/blackscholes.asp"
            className="mr-4 hover:underline"
          >
            About
          </a>
        </div>
      </div>
    </nav>
  );
}
