import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { storeService } from "../main";
import toast from "react-hot-toast";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-gray-100 text-gray-700";
    case "accepted":
      return "bg-gray-200 text-gray-800";
    case "preparing":
      return "bg-gray-800 text-white";
    case "ready_for_rider":
      return "bg-gray-900 text-white";
    case "picked_up":
      return "bg-gray-700 text-white";
    case "delivered":
      return "bg-black text-white";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${storeService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} x {item.quauntity}
          </p>
        ))}
      </div>

      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>

      <p className="text-xs text-gray-400">Payment: {order.paymentStatus}</p>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-md bg-black px-3 py-1 text-xs text-white hover:bg-gray-900 disabled:opacity-50"
            >
              Mark as {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-2">
          <button
            className="btn-secondary w-full py-2 text-xs disabled:opacity-50"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
