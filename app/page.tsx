"use client";

/* 
  Prop Firm Futures Risk Dashboard 
  
  This page simulates a risk dashboard for a prop firm trading futures. 
  It displays key metrics such as account balance, open positions, profit/loss, and risk exposure. 
  The dashboard is designed to help traders monitor their performance and make informed decisions. 

  - Real-time price movements and market data are displayed to provide traders with up-to-date information.
  - Open futures positions are listed with details such as entry price, current price, and unrealized profit/loss.
  - Profit and loss metrics are calculated based on the current market prices and displayed in a clear format.
  - Account risk rules are implemented to ensure that traders do not exceed predefined risk limits.
  - Order approval and rejections are handled based on the risk rules.
  - Evaluation of trading performance is shown through profit target progress.

  **** This is not connected to a real broker or trading platform and is intended for a simulation.****
*/

/*
  Main dashboard page.

  This page now coordinates the full app:
  - state management
  - simulated market movement
  - account calculations
  - order confirmations
  - risk checks
  - rendering dashboard components
*/

import { useEffect, useMemo, useState } from "react";

import { Metric } from "@/components/Metric";
import { OrderLog } from "@/components/OrderLog";
import { PositionsTable } from "@/components/PositionsTable";
import { RiskRulesCard } from "@/components/RiskRulesCard";

import { initialPositions, rules } from "@/data/mockdata";

import { randomMove } from "@/lib/marketsimulator";
import { checkRisk } from "@/lib/riskengine";
import { Order, Position, Side } from "@/lib/types";

import { MarketChart } from "@/components/MarketChart";

import {
  calculateAccountBalance,
  calculateDrawdownRemaining,
  calculateNetProfit,
  calculateProfitTargetProgress,
  calculateUnrealizedPnL,
} from "@/lib/tradingmath";

export default function Home() {
  /*
    positions:
    Stores the current open futures positions.
  */
  const [positions, setPositions] = useState<Position[]>(initialPositions);

  /*
    orders:
    Stores recent order attempts for the audit log.
  */
  const [orders, setOrders] = useState<Order[]>([]);

  /*
    realizedPnL:
    PnL already locked in.

    For now, we subtract a small commission on every filled order.
    Later, we can improve this by calculating realized PnL when trades close.
  */
  const [realizedPnL, setRealizedPnL] = useState<number>(450);

  /*
    unrealizedPnL:
    Calculated from open positions.

    useMemo prevents recalculating unless positions change.
  */
  const unrealizedPnL = useMemo(() => {
    return calculateUnrealizedPnL(positions);
  }, [positions]);

  /*
    dailyPnL:
    Combines realized and unrealized performance.
  */
  const dailyPnL = realizedPnL + unrealizedPnL;

  /*
    accountBalance:
    Starting account balance plus all current profit/loss.
  */
  const accountBalance = calculateAccountBalance(
    rules.startingBalance,
    realizedPnL,
    unrealizedPnL
  );

  /*
    highWaterMark:
    Tracks the highest account balance reached.

    This is important for trailing drawdown.
  */
  const [highWaterMark, setHighWaterMark] = useState<number>(
    rules.startingBalance
  );

  /*
    Whenever account balance makes a new high,
    update the high water mark.
  */
  useEffect(() => {
    if (accountBalance > highWaterMark) {
      setHighWaterMark(accountBalance);
    }
  }, [accountBalance, highWaterMark]);

  /*
    netProfit:
    Current account profit above starting balance.
  */
  const netProfit = calculateNetProfit(accountBalance, rules.startingBalance);

  /*
    drawdownRemaining:
    Remaining room before trailing drawdown is breached.
  */
  const drawdownRemaining = calculateDrawdownRemaining(
    highWaterMark,
    accountBalance,
    rules.trailingDrawdown
  );

  /*
    targetProgress:
    Percentage progress toward profit target.
  */
  const targetProgress = calculateProfitTargetProgress(
    netProfit,
    rules.profitTarget
  );

  /*
    Market simulation.

    Every second, prices randomly move.
  */
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((currentPositions) =>
        currentPositions.map((position) => {
          const move =
            position.symbol === "ES"
              ? randomMove(0.25, 6)
              : randomMove(0.25, 20);

          return {
            ...position,
            lastPrice: Number((position.lastPrice + move).toFixed(2)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /*
    placeOrder:
    Handles Buy/Sell button clicks.

    Flow:
    1. Confirm with user.
    2. Find current position.
    3. Calculate projected position.
    4. Run risk checks.
    5. Log the order.
    6. Update position if filled.
  */
  function placeOrder(symbol: string, side: Side, qty: number) {
    const confirmed = window.confirm(`Confirm order: ${side} ${qty} ${symbol}?`);

    /*
      If user cancels, log it as a cancelled order.
    */
    if (!confirmed) {
      const cancelledOrder: Order = {
        id: Date.now(),
        symbol,
        side,
        qty,
        price: 0,
        status: "CANCELLED",
        reason: "User cancelled order confirmation",
        time: new Date().toLocaleTimeString(),
      };

      setOrders((currentOrders) =>
        [cancelledOrder, ...currentOrders].slice(0, 10)
      );

      return;
    }

    /*
      Find the current position for the selected symbol.
    */
    const position = positions.find((p) => p.symbol === symbol);

    if (!position) {
      return;
    }

    /*
      BUY increases qty.
      SELL decreases qty.
    */
    const signedQty = side === "BUY" ? qty : -qty;

    /*
      Project what the new position would be after the order.
    */
    const newNetQty = position.qty + signedQty;

    /*
      Run pre-trade risk checks.
    */
    const riskResult = checkRisk({
      currentNetQty: position.qty,
      newNetQty,
      dailyPnL,
      drawdownRemaining,
      qty,
      rules,
    });

    /*
      Create the order log entry.
    */
    const order: Order = {
      id: Date.now(),
      symbol,
      side,
      qty,
      price: position.lastPrice,
      status: riskResult.allowed ? "FILLED" : "REJECTED",
      reason: riskResult.reason,
      time: new Date().toLocaleTimeString(),
    };

    /*
      Add newest order first and keep last 10.
    */
    setOrders((currentOrders) => [order, ...currentOrders].slice(0, 10));

    /*
      Stop if order was rejected.
    */
    if (!riskResult.allowed) {
      return;
    }

    /*
      Update the position if filled.
    */
    /*
  Calculate realized PnL when the order reduces or closes a position.

  Example:
  Long 1 ES from 4000.
  Sell 1 ES at 4050.
  Realized PnL = (4050 - 4000) * 1 * 50 = $2500.

  This fixes the issue where closing a profitable trade caused
  unrealized PnL to disappear without becoming realized PnL.
*/
const currentQty = position.qty;
const isClosingOrReducing =
  Math.abs(newNetQty) < Math.abs(currentQty) ||
  Math.sign(currentQty) !== Math.sign(newNetQty);

const closedQty = isClosingOrReducing
  ? Math.min(Math.abs(currentQty), qty)
  : 0;

const tradePnL =
  isClosingOrReducing
    ? (position.lastPrice - position.avgPrice) *
      Math.sign(currentQty) *
      closedQty *
      position.multiplier
    : 0;

const commission = 2.5;

setPositions((currentPositions) =>
  currentPositions.map((p) => {
    if (p.symbol !== symbol) {
      return p;
    }

    return {
      ...p,
      qty: newNetQty,

      /*
        If position is flat, reset avg price.
        If adding to a position, keep current avg price for now.
      */
      avgPrice: newNetQty === 0 ? p.lastPrice : p.avgPrice,
    };
  })
);

/*
  Add realized trade PnL and subtract commission.
*/
setRealizedPnL((currentPnL) => currentPnL + tradePnL - commission);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm text-cyan-400">
            Prop Firm Futures Risk Dashboard Demo
          </p>

          <h1 className="text-3xl font-bold">
            Prop Firm Futures Risk Dashboard
          </h1>

          <p className="text-slate-400">
            Simulates account balance, high-water-mark drawdown, order
            confirmations, PnL, and prop firm risk checks.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric
            title="Account Balance"
            value={`$${accountBalance.toFixed(2)}`}
          />

          <Metric
            title="Daily PnL"
            value={`$${dailyPnL.toFixed(2)}`}
            danger={dailyPnL < 0}
          />

          <Metric
            title="Drawdown Remaining"
            value={`$${drawdownRemaining.toFixed(2)}`}
            danger={drawdownRemaining < 500}
          />

          <Metric
            title="Profit Target"
            value={`${targetProgress.toFixed(1)}%`}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric
            title="Realized PnL"
            value={`$${realizedPnL.toFixed(2)}`}
            danger={realizedPnL < 0}
          />

          <Metric
            title="Unrealized PnL"
            value={`$${unrealizedPnL.toFixed(2)}`}
            danger={unrealizedPnL < 0}
          />

          <Metric
            title="High Water Mark"
            value={`$${highWaterMark.toFixed(2)}`}
          />
        </section>

        {/* Market chart section */}
        <MarketChart />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PositionsTable positions={positions} onPlaceOrder={placeOrder} />
          <RiskRulesCard rules={rules} />
        </section>

        <OrderLog orders={orders} />
      </div>
    </main>
  );
}