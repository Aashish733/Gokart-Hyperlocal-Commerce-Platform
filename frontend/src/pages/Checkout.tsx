import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
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
        `${restaurantService}/api/address/all`,
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
        `${restaurantService}/api/address/new`,
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
      <div className="flex min-h-[60vh] item-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
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
          color: "#E23744",
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
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Delivery Address</h3>
          <button
            onClick={() => setIsMapOpen(true)}
            className="text-sm font-medium text-[#E23744] flex items-center gap-1 hover:underline"
          >
            <BiPlus size={16} /> Add Address
          </button>
        </div>

        {showMobileInput && (
          <div className="rounded-lg border p-3 bg-gray-50 space-y-3">
            <p className="text-sm font-medium text-gray-700">📍 {newLoc?.address}</p>
            <input
              type="number"
              placeholder="Mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={submitNewAddress} disabled={addingAddress} className="bg-[#E23744] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {addingAddress ? "Saving..." : "Save Address"}
              </button>
              <button onClick={() => setShowMobileInput(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
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
                className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressId === add._id
                    ? "border-[#e23744] bg-red-50"
                    : "hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === add._id}
                  onChange={() => setselectedAddressId(add._id)}
                />
                <div>
                  <p className="text-sm font-medium">{add.formattedAddress}</p>
                  <p className="text-xs text-gray-500">{add.mobile}</p>
                </div>
              </label>
            ))
          )
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>

        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;

          return (
            <div className="flex justify-between text-sm" key={cartItem._id}>
              <span>
                {item.name} x {cartItem.quauntity}
              </span>
              <span>₹{item.price * cartItem.quauntity}</span>
            </div>
          );
        })}

        <hr />

        <div className="flex justify-between text-sm">
          <span>Items ({quauntity})</span>
          <span>₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>PlatForm Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {subTotal < 250 && (
          <p className="text-xs text-gray-500">
            Add Item worth ₹{250 - subTotal} more to get Free delivery
          </p>
        )}

        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>

        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
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
