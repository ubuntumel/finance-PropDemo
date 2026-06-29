/*
    This file stores shared TypeScript types.
    Defining Position, Order, Side, and RiskRules in many files, we define them once here
    and import them everywhere else. Makes debugging easier and easier to maintain.
*/
/*
    Side respresents the direction of the trade / order.
    BUY:
    - Increases a Long position
    - Reduces a Short position

    SELL:
    - Increases a Short position
    - Reduces a Long position
*/
export type Side = "BUY" | "SELL";

/*
    Position represents the current open position for one futures symbol.
    Ex:
    ES qty = 1 means Long 1 ES contract
    NQ qty = -1 means Short 1 NQ contract
    
    multiplier:
    Futures contracts have dollar multipliers.
    ES is commonly $50 per point.
    NQ is commonly $20 per point.
 */
export type Position = {
    symbol: string;
    qty: number;
    multiplier: number;
    avgPrice: number;
    lastPrice: number;
};

/*
    OrderStatus describes what happened after the user attempted an order.
    
    FILLED:
    The order passed risk checks and updated the position.

    REJECTED:
    The order failed the risk rule.

    CANCELLED:
    The user declined the confirmation popup.
*/
export type OrderStatus = "FILLED" | "REJECTED" | "CANCELLED";

/*
    Order represents and order attempt.
    In a real trading system, rejected or cancelled orders would also be logged for auditing and compliance.
*/
export type Order ={
    id: number;
    symbol: string;
    qty: number;
    side: Side;
    price: number;
    status: OrderStatus;
    reason?: string;
    time: string;
};

/*
    RiskRules represent the firm account rules.

    These are the simulated rules a prop firm might apply to a trader account.
    - max contracts
    - daily loss limit
    - trailing drawdown
    - profit target
    - starting balance
*/
export type RiskRules = {
    maxContractQty: number;
    dailyLossLimit: number;
    trailingDrawdown: number;
    profitTarget: number;
    startingBalance: number;
}