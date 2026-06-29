/*
  This file contains financial math helpers.

  Trading calculations should not be buried inside UI components.
  Keeping math functions separate makes them:
  - easier to test
  - easier to debug
  - easier to explain in interviews
*/

import { Position } from "@/lib/types";

/*
  Calculates profit/loss for one position.

  Formula:
  (lastPrice - avgPrice) * qty * multiplier

  If qty is negative, the position is short.
  That naturally flips the PnL calculation.
*/
export function calculatePositionPnL(position: Position) {
  return (
    (position.lastPrice - position.avgPrice) *
    position.qty *
    position.multiplier
  );
}

/*
  Calculates total unrealized PnL across all open positions.

  Unrealized PnL means profit/loss that exists on open positions
  but has not been locked in by closing the trade.
*/
export function calculateUnrealizedPnL(positions: Position[]) {
  return positions.reduce((total, position) => {
    return total + calculatePositionPnL(position);
  }, 0);
}

/*
  Calculates current account balance.

  Account balance is:
  starting balance + realized PnL + unrealized PnL

  This is better than only using daily PnL because it directly models
  how the account value changes.
*/
export function calculateAccountBalance(
  startingBalance: number,
  realizedPnL: number,
  unrealizedPnL: number
) {
  return startingBalance + realizedPnL + unrealizedPnL;
}

/*
  Net profit is how far above or below the starting balance the account is.

  This is what we use for profit target progress.
*/
export function calculateNetProfit(
  accountBalance: number,
  startingBalance: number
) {
  return accountBalance - startingBalance;
}

/*
  Calculates progress toward the prop firm profit target.

  Math.max prevents negative percentages.
  Math.min prevents values above 100%.
*/
export function calculateProfitTargetProgress(
  netProfit: number,
  profitTarget: number
) {
  return Math.max(0, Math.min((netProfit / profitTarget) * 100, 100));
}

/*
  Calculates remaining drawdown.

  High water mark:
  The highest account balance reached so far.

  Drawdown used:
  highWaterMark - accountBalance

  Drawdown remaining:
  trailingDrawdown - drawdownUsed
*/
export function calculateDrawdownRemaining(
  highWaterMark: number,
  accountBalance: number,
  trailingDrawdown: number
) {
  const drawdownUsed = highWaterMark - accountBalance;
  return trailingDrawdown - drawdownUsed;
}