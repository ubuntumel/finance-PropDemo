"use client";

/*
  MarketChart Component

  This component displays a simulated candlestick chart using
  TradingView Lightweight Charts.

  Important:
  Lightweight Charts version 5 changed the API.

  Old version:
  chart.addCandlestickSeries()

  New version:
  chart.addSeries(CandlestickSeries, options)

  This file uses the correct Version 5 syntax.
*/

import { useEffect, useRef } from "react";

import {
  CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
} from "lightweight-charts";

export function MarketChart() {
  /*
    chartContainerRef points to the div where the chart will be rendered.

    React needs this because Lightweight Charts draws into a real DOM element.
  */
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  /*
    useEffect runs after the component appears on the page.

    We create the chart inside useEffect because the browser DOM must exist first.
  */
  useEffect(() => {
    /*
      If the div does not exist yet, stop.
      This protects us from runtime errors.
    */
    if (!chartContainerRef.current) {
      return;
    }

    /*
      Create the chart.

      This controls the visual container:
      - height
      - background color
      - grid color
      - text color
    */
    const chart = createChart(chartContainerRef.current, {
      height: 320,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0f172a",
        },
        textColor: "#cbd5e1",
      },

      grid: {
        vertLines: {
          color: "#1e293b",
        },
        horzLines: {
          color: "#1e293b",
        },
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    /*
      Version 5 syntax:

      We add a candlestick series by calling chart.addSeries()
      and passing CandlestickSeries as the first argument.
    */
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    /*
      Generate fake candle data for the demo.
      Later, this could be replaced with real ES/NQ market data.
    */
    const candles = generateCandles();

    /*
      Load candles into the chart.
    */
    candleSeries.setData(candles);

    /*
      Fit all candle data into view.
    */
    chart.timeScale().fitContent();

    /*
      Make chart resize when browser size changes.
    */
    const handleResize = () => {
      if (!chartContainerRef.current) {
        return;
      }

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    /*
      Cleanup:
      Remove event listener and chart when component unmounts.
    */
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <section className="rounded-xl bg-slate-900 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">ES / NQ Market Chart</h2>

        <p className="text-sm text-slate-400">
          Simulated candlestick chart using TradingView Lightweight Charts.
        </p>
      </div>

      {/* Lightweight Charts renders inside this div */}
      <div ref={chartContainerRef} />
    </section>
  );
}

/*
  generateCandles:
  Creates fake candlestick data for the chart.

  Each candle has:
  - time
  - open
  - high
  - low
  - close

  This is enough to make the chart look like market data.
*/
function generateCandles(): CandlestickData[] {
  const candles: CandlestickData[] = [];

  /*
    Start fake ES price around 4050.
  */
  let price = 4050;

  /*
    Generate 40 candles.
    Each candle represents one minute.
  */
  for (let i = 0; i < 40; i++) {
    const open = price;
    const close = open + randomPriceMove();

    /*
      High should be above both open and close.
      Low should be below both open and close.
    */
    const high = Math.max(open, close) + Math.random() * 8;
    const low = Math.min(open, close) - Math.random() * 8;

    candles.push({
      /*
        Lightweight Charts accepts Unix timestamp seconds.
      */
      time: Math.floor(Date.now() / 1000 - (40 - i) * 60) as CandlestickData["time"],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    /*
      The next candle starts where the previous candle closed.
    */
    price = close;
  }

  return candles;
}

/*
  randomPriceMove:
  Creates a random up or down movement for each candle.
*/
function randomPriceMove() {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const move = Math.random() * 12;

  return direction * move;
}