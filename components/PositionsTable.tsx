/*
  PositionsTable displays current open futures positions.

  This component receives:
  - positions: the current open trades
  - onPlaceOrder: a function from page.tsx that handles buy/sell clicks

  We pass the order function in as a prop so this component stays reusable.
*/

import { Position, Side } from "@/lib/types";
import { calculatePositionPnL } from "@/lib/tradingmath";

export function PositionsTable({
  positions,
  onPlaceOrder,
}: {
  positions: Position[];
  onPlaceOrder: (symbol: string, side: Side, qty: number) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-900 p-5 lg:col-span-2">
      <h2 className="mb-4 text-xl font-semibold">Open Positions</h2>

      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="py-2 text-left">Symbol</th>
            <th className="text-right">QTY</th>
            <th className="text-right">Avg Price</th>
            <th className="text-right">Last Price</th>
            <th className="text-right">Unrealized P&L</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {positions.map((position) => {
            /*
              Calculate row-level PnL for each symbol.
            */
            const pnl = calculatePositionPnL(position);

            return (
              <tr key={position.symbol} className="border-t border-slate-800">
                <td className="py-3 font-semibold">{position.symbol}</td>
                <td className="text-right">{position.qty}</td>
                <td className="text-right">{position.avgPrice.toFixed(2)}</td>
                <td className="text-right">{position.lastPrice.toFixed(2)}</td>

                <td
                  className={`text-right ${
                    pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ${pnl.toFixed(2)}
                </td>

                <td className="space-x-2 text-right">
                  <button
                    onClick={() => onPlaceOrder(position.symbol, "BUY", 1)}
                    className="rounded bg-emerald-600 px-3 py-1 hover:bg-emerald-500"
                  >
                    Buy
                  </button>

                  <button
                    onClick={() => onPlaceOrder(position.symbol, "SELL", 1)}
                    className="rounded bg-red-600 px-3 py-1 hover:bg-red-500"
                  >
                    Sell
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}