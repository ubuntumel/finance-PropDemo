/*
  OrderLog displays recent order attempts.

  It shows:
  - filled orders
  - rejected orders
  - cancelled orders

  This matters because trading systems need audit logs.
*/

import { Order } from "@/lib/types";

export function OrderLog({ orders }: { orders: Order[] }) {
  return (
    <section className="rounded-xl bg-slate-900 p-5">
      <h2 className="mb-4 text-xl font-semibold">Order / Risk Log</h2>

      <div className="space-y-2">
        {orders.length === 0 && (
          <p className="text-slate-400">
            No orders yet. Try buying or selling ES / NQ.
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col justify-between gap-2 rounded bg-slate-800 p-3 text-sm md:flex-row"
          >
            <span>
              {order.time} - {order.side} {order.qty} {order.symbol} @{" "}
              {order.price}
            </span>

            <span
              className={
                order.status === "FILLED"
                  ? "text-emerald-400"
                  : order.status === "CANCELLED"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {order.status}
              {order.reason ? `: ${order.reason}` : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}