import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { storeService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IStore } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader, BiPlus } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";
import LocationModal from "../components/LocationModal";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quauntity } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setselectedAddressId] = useState<string | null>(
    null
  );

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const [newLoc, setNewLoc] = useState<{ lat: number, lng: number, address: string, city: string } | null>(null);
  const [mobile, setMobile] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);

  const fetchAddresses = async () => {
    if (!cart || cart.length === 0) {
      setLoadingAddress(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `${storeService}/api/address/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAddresses(data || []);
      if (data && data.length > 0) {
        setselectedAddressId(data[0]._id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [cart]);

  const handleConfirmLocation = (lat: number, lng: number, address: string, city: string) => {
    setNewLoc({ lat, lng, address, city });
    setShowMobileInput(true);
  };

  const submitNewAddress = async () => {
    if (!mobile) return toast.error("Mobile number is required");
    try {
      setAddingAddress(true);
      await axios.post(
        `${storeService}/api/address/new`,
        {
          formattedAddress: newLoc?.address,
          mobile,
          latitude: newLoc?.lat,
          longitude: newLoc?.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchAddresses();

      setShowMobileInput(false);
      setMobile("");
      setNewLoc(null);
      toast.success("Address added successfully");
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setAddingAddress(false);
    }
  };

  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-lg text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  const store = cart[0].storeId as IStore;

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${storeService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create Order";
      toast.error(msg);
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Gokart",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successfull 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;

      try {
        await stripePromise;

        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          {
            orderId,
          }
        );

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("failed to create payment session");
        }
      } catch (error) {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };
  return (
    <div className="page-shell max-w-4xl space-y-6">
      <header>
        <p className="label-caps mb-2">Secure checkout</p>
        <h1 className="page-title">Review & pay</h1>
      </header>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900">{store.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {store.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="card space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-gray-900">Delivery Address</h3>
          <button
            onClick={() => setIsMapOpen(true)}
            className="btn-secondary inline-flex w-fit items-center gap-1 self-start"
          >
            <BiPlus size={16} /> Add Address
          </button>
        </div>

        {showMobileInput && (
          <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-gray-700">📍 {newLoc?.address}</p>
            <input
              type="number"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="input-field !mt-0"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={submitNewAddress} disabled={addingAddress} className="btn-primary sm:flex-1">
                {addingAddress ? "Saving..." : "Save Address"}
              </button>
              <button onClick={() => setShowMobileInput(false)} className="btn-secondary sm:flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showMobileInput && (
          loadingAddress ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-500">
              No address found. Please add one
            </p>
          ) : (
            addresses.map((add) => (
              <label
                key={add._id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${
                  selectedAddressId === add._id
                    ? "border-gray-950 bg-gray-50 shadow-sm ring-1 ring-gray-950/10"
                    : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === add._id}
                  onChange={() => setselectedAddressId(add._id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{add.formattedAddress}</p>
                  <p className="text-xs text-gray-500">{add.mobile}</p>
                </div>
              </label>
            ))
          )
        )}
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
          <h3 className="font-semibold text-gray-950">Order summary</h3>
          <p className="mt-0.5 text-xs text-gray-500">Review line items and fees before payment</p>
        </div>

        <div className="divide-y divide-gray-100 px-5 sm:px-6">
          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;

            return (
              <div className="billing-row text-gray-700" key={cartItem._id}>
                <span className="min-w-0 truncate pr-4">
                  {item.name}{" "}
                  <span className="text-gray-400">× {cartItem.quauntity}</span>
                </span>
                <span className="shrink-0 tabular-nums font-medium text-gray-900">
                  ₹{item.price * cartItem.quauntity}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 bg-gray-50/80 px-5 py-3 sm:px-6">
          <div className="billing-row text-gray-600">
            <span>Items ({quauntity})</span>
            <span className="tabular-nums">₹{subTotal}</span>
          </div>
          <div className="billing-row text-gray-600">
            <span>Delivery fee</span>
            <span className="tabular-nums">
              {deliveryFee === 0 ? (
                <span className="font-medium text-gray-900">Free</span>
              ) : (
                `₹${deliveryFee}`
              )}
            </span>
          </div>
          <div className="billing-row text-gray-600">
            <span>Platform fee</span>
            <span className="tabular-nums">₹{platformFee}</span>
          </div>

          {subTotal < 250 && (
            <p className="pb-1 text-xs text-gray-500">
              Add ₹{250 - subTotal} more for free delivery
            </p>
          )}

          <div className="billing-row border-t border-gray-200 pt-3 text-base font-semibold text-gray-950">
            <span>Total due</span>
            <span className="tabular-nums">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900">Payment Method</h3>

        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-black disabled:opacity-50"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Razorpay
        </button>

        <button
          disabled={!selectedAddressId || loadingStripe || creatingOrder}
          onClick={payWithStripe}
          className="btn-primary flex w-full min-h-11 items-center justify-center gap-2"
        >
          {loadingStripe ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Stripe
        </button>
      </div>

      <LocationModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleConfirmLocation}
      />
    </div>
  );
};

export default Checkout;
