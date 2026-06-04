import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiMapPin, BiPhone, BiStore } from "react-icons/bi";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const statusSteps = [
  "rider_assigned",
  "picked_up",
  "delivered",
] as const;

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const stepIndex = statusSteps.indexOf(
    order.status as (typeof statusSteps)[number]
  );

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps">Active delivery</p>
          <h2 className="text-lg font-semibold text-gray-950">
            Order #{order._id.slice(-8).toUpperCase()}
          </h2>
        </div>
        <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="flex gap-1">
        {statusSteps.map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full ${
              i <= stepIndex ? "bg-gray-900" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex gap-3 rounded-md border border-gray-100 bg-gray-50/80 p-3">
          <BiStore className="mt-0.5 h-4 w-4 shrink-0 text-gray-700" />
          <div>
            <p className="text-xs font-medium text-gray-500">Pickup store</p>
            <p className="font-medium text-gray-900">{order.storeName}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-md border border-gray-100 bg-gray-50/80 p-3">
          <BiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-700" />
          <div>
            <p className="text-xs font-medium text-gray-500">Customer address</p>
            <p className="font-medium text-gray-900">
              {order.deliveryAddress.fromattedAddress}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 divide-y divide-gray-100 text-sm">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between gap-2 px-3 py-2 text-gray-700"
          >
            <span>
              {item.name} × {item.quauntity}
            </span>
            <span className="tabular-nums">₹{item.price * item.quauntity}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Distance</p>
          <p className="font-semibold text-gray-950">
            {typeof order.distance === "number"
              ? order.distance.toFixed(1)
              : order.distance}{" "}
            km
          </p>
        </div>
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Your earning</p>
          <p className="font-semibold text-gray-950">₹{order.riderAmount}</p>
        </div>
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Order total</p>
          <p className="font-semibold text-gray-950">₹{order.totalAmount}</p>
        </div>
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Payment</p>
          <p className="font-semibold capitalize text-gray-950">
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {order.deliveryAddress.mobile && (
        <a
          href={`tel:${order.deliveryAddress.mobile}`}
          className="btn-secondary flex w-full items-center justify-center gap-2"
        >
          <BiPhone size={18} />
          Call customer ({order.deliveryAddress.mobile})
        </a>
      )}

      <div className="space-y-2">
        {order.status === "rider_assigned" && (
          <button type="button" onClick={updateStatus} className="btn-primary w-full">
            Picked up from store
          </button>
        )}
        {order.status === "picked_up" && (
          <button type="button" onClick={updateStatus} className="btn-primary w-full">
            Mark as delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
