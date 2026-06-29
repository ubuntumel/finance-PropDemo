/*
  Pre-trade risk engine.

  Important rule:
  If the trader has breached drawdown, we should block orders that add risk,
  but we should still allow orders that reduce or flatten the position.

  Example:
  ES position = long 1
  SELL 1 reduces exposure to 0, so it should be allowed.
*/

import { RiskRules } from "@/lib/types";

export function checkRisk({
  currentNetQty,
  newNetQty,
  dailyPnL,
  drawdownRemaining,
  qty,
  rules,
}: {
  currentNetQty: number;
  newNetQty: number;
  dailyPnL: number;
  drawdownRemaining: number;
  qty: number;
  rules: RiskRules;
}) {
  if (qty <= 0) {
    return {
      allowed: false,
      reason: "Invalid quantity",
    };
  }

  const currentExposure = Math.abs(currentNetQty);
  const newExposure = Math.abs(newNetQty);
  const isReducingRisk = newExposure < currentExposure;

  if (Math.abs(newNetQty) > rules.maxContractQty) {
    return {
      allowed: false,
      reason: "Max contract limit exceeded",
    };
  }

  if (dailyPnL <= -rules.dailyLossLimit && !isReducingRisk) {
    return {
      allowed: false,
      reason: "Daily loss limit breached",
    };
  }

  if (drawdownRemaining <= 0 && !isReducingRisk) {
    return {
      allowed: false,
      reason: "Trailing drawdown breached",
    };
  }

  return {
    allowed: true,
  };
}