import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response.data.message);
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };
  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-center text-xs font-semibold text-gray-700">
        Accept within {secondsLeft}
      </p>

      <p className="text-center text-xs font-semibold text-gray-900">
        New delivery request
      </p>

      <p className="text-xs text-gray-600">
        Order ID: <b>{orderId.slice(-6)}</b>
      </p>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="btn-primary w-full min-h-11 py-2.5"
      >
        {accepting ? "Accepting..." : "Accept order"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
