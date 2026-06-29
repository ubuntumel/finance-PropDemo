/*
  This file simulates market movement.

  In production, this would be replaced by real market data from:
  - Tradovate
  - Rithmic
  - CQG
  - Trading Technologies
  - CME market data
*/

/*
  Creates a random price movement.

  tickSize:
  Minimum price increment.

  maxTicks:
  Maximum number of ticks the price can move in one update.
*/
export function randomMove(tickSize: number, maxTicks: number) {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const ticks = Math.floor(Math.random() * maxTicks) + 1;

  return direction * ticks * tickSize;
}