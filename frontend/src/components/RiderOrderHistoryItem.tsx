import type { IOrder } from "../types";
import { BiMapPin, BiStore } from "react-icons/bi";

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusLabel = (status: string) =>
  status.replaceAll("_", " ");

interface Props {
  order: IOrder;
  compact?: boolean;
}

const RiderOrderHistoryItem = ({ order, compact }: Props) => {
  return (
    <article className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400">
            #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-0.5 font-semibold text-gray-950">{order.storeName}</p>
          <p className="text-xs capitalize text-gray-500">
            {statusLabel(order.status)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tabular-nums text-gray-950">
            ₹{order.riderAmount}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Your earning
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <BiStore className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                <span className="font-medium text-gray-800">Pickup:</span>{" "}
                {order.storeName}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <BiMapPin className="mt-0.5 shrink-0 text-gray-400" />
              <span className="line-clamp-2">
                <span className="font-medium text-gray-800">Drop:</span>{" "}
                {order.deliveryAddress.fromattedAddress}
              </span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>{order.distance?.toFixed?.(1) ?? order.distance} km</span>
            <span>·</span>
            <span>{order.items.length} items</span>
            <span>·</span>
            <span>Order ₹{order.totalAmount}</span>
            <span>·</span>
            <span>{formatDate(order.updatedAt)}</span>
          </div>
        </>
      )}

      {compact && (
        <p className="mt-2 truncate text-xs text-gray-500">
          {order.deliveryAddress.fromattedAddress}
        </p>
      )}
    </article>
  );
};

export default RiderOrderHistoryItem;
