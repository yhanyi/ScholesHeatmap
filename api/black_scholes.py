from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import yfinance as yf
import numpy as np
from scipy.stats import norm
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockRequest(BaseModel):
    stock: str
    startDate: str
    endDate: str
    strikePrice: Optional[float] = Field(None, description="Strike price for option calculation")
    timeToMaturity: Optional[float] = Field(1.0, description="Time to maturity in years")
    riskFreeRate: Optional[float] = Field(0.01, description="Risk-free interest rate")
    minSpotPrice: Optional[float] = Field(None, description="Minimum spot price for heatmap")
    maxSpotPrice: Optional[float] = Field(None, description="Maximum spot price for heatmap")

def black_scholes(S, K, T, r, sigma, option_type="call"):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    if option_type == "call":
        price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    
    return price

@app.post("/api/black-scholes")
async def fetch_data_and_calculate(request: StockRequest):
    logger.info(f"Received request: {request}")
    start_time = time.time()
    
    try:
        # Fetch data
        data = yf.Ticker(request.stock)
        hist = data.history(start=request.startDate, end=request.endDate)
        logger.info(f"Historical data fetched: {len(hist)} rows")
        
        if hist.empty:
            logger.warning("No data available for the specified ticker and date range.")
            raise HTTPException(status_code=404, detail="No data available for the specified ticker and date range.")

        logger.info(f"Data fetched in {time.time() - start_time:.2f} seconds")

        # Calculate parameters
        S = hist['Close'].iloc[-1]  # Current stock price
        sigma = hist['Close'].pct_change().std() * np.sqrt(252)  # Annualized volatility
        K = request.strikePrice if request.strikePrice is not None else S
        T = request.timeToMaturity
        r = request.riskFreeRate
        min_spot = request.minSpotPrice if request.minSpotPrice is not None else 0.8 * S
        max_spot = request.maxSpotPrice if request.maxSpotPrice is not None else 1.2 * S

        spot_prices = np.linspace(min_spot, max_spot, 20)
        volatilities = np.linspace(0.5 * sigma, 1.5 * sigma, 20)
        
        call_data = []
        put_data = []

        for i, spot in enumerate(spot_prices):
          call_row = {"id": f"{spot:.2f}"}
          put_row = {"id": f"{spot:.2f}"}
          for j, vol in enumerate(volatilities):
              call_price = black_scholes(spot, K, T, r, vol, "call")
              put_price = black_scholes(spot, K, T, r, vol, "put")
              call_row[f"{vol:.2f}"] = round(call_price, 2)
              put_row[f"{vol:.2f}"] = round(put_price, 2)
          call_data.append(call_row)
          put_data.append(put_row)

        logger.info(f"Calculations completed in {time.time() - start_time:.2f} seconds")

        result = {
            "callData": call_data,
            "putData": put_data,
            "currentPrice": S,
            "impliedVolatility": sigma,
            "strikePrice": K,
            "timeToMaturity": T,
            "riskFreeRate": r
        }
        
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.options("/api/black-scholes")
async def options_black_scholes():
    return JSONResponse(status_code=200, content={})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)