/*
  This file stores mock/simulated data.

  In a real app, this data would probably come from:
  - a backend API
  - a database
  - a broker connection
  - a prop firm account service

  For our demo, we keep it local and simple.
*/

import { Position, RiskRules } from "@/lib/types";

/*
  Starting positions displayed when the app loads.
*/
export const initialPositions: Position[] = [
  {
    symbol: "ES",
    qty: 1,
    multiplier: 50,
    avgPrice: 4000,
    lastPrice: 4050,
  },
  {
    symbol: "NQ",
    qty: -1,
    multiplier: 20,
    avgPrice: 12000,
    lastPrice: 11950,
  },
];

/*
  Simulated prop firm evaluation rules.
  In production, these would likely be stored in a database and loaded per account.
*/
export const rules: RiskRules = {
  maxContractQty: 5,
  dailyLossLimit: 1000,
  trailingDrawdown: 2500,
  profitTarget: 5000,
  startingBalance: 10000,
};