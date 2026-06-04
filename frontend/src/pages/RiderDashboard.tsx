import { useCallback, useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import {
  BiLogOut,
  BiUpload,
  BiUser,
  BiGridAlt,
  BiPackage,
  BiHistory,
} from "react-icons/bi";
import type {
  IOrder,
  IRiderDashboardStats,
  IRiderOrderPagination,
} from "../types";
import audio from "../assets/faaah.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import RiderStatsOverview from "../components/RiderStatsOverview";
import RiderOrderHistoryItem from "../components/RiderOrderHistoryItem";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
  createdAt?: string;
}

type TabId = "overview" | "current" | "history" | "profile";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RiderDashboard = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [stats, setStats] = useState<IRiderDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [history, setHistory] = useState<IOrder[]>([]);
  const [historyPagination, setHistoryPagination] =
    useState<IRiderOrderPagination | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "none";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound enabled");
    } catch {
      toast.error("Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);
    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: authHeaders(),
      });
      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!profile) return;
    setStatsLoading(true);
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/dashboard/stats`,
        { headers: authHeaders() }
      );
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    if (!profile) return;
    setHistoryLoading(true);
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/orders/history`,
        {
          params: { page, limit: 10, status: "delivered" },
          headers: authHeaders(),
        }
      );
      setHistory(data.orders ?? []);
      setHistoryPagination(data.pagination ?? null);
      setHistoryPage(page);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCurrentOrder = async () => {
    if (!profile) {
      setCurrentOrder(null);
      return;
    }
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        { headers: authHeaders() }
      );
      setCurrentOrder(data.order ?? null);
    } catch {
      setCurrentOrder(null);
    }
  };

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchCurrentOrder(),
      fetchStats(),
      fetchHistory(historyPage),
    ]);
  }, [profile?._id, historyPage]);

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchCurrentOrder();
      fetchStats();
      fetchHistory(1);
    }
  }, [profile?._id]);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location access required");
      return;
    }

    setToggling(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.patch(
            `${riderService}/api/rider/toggle`,
            {
              isAvailble: !profile?.isAvailble,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            { headers: authHeaders() }
          );
          toast.success(
            profile?.isAvailble ? "You are offline" : "You are online"
          );
          fetchProfile();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Toggle failed");
        } finally {
          setToggling(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setToggling(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!image) {
      toast.error("Profile photo is required");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location access is required");
      return;
    }

    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const formData = new FormData();
        formData.append("phoneNumber", phoneNumber);
        formData.append("aadharNumber", aadharNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", pos.coords.latitude.toString());
        formData.append("longitude", pos.coords.longitude.toString());
        formData.append("file", image);

        try {
          const { data } = await axios.post(
            `${riderService}/api/rider/new`,
            formData,
            { headers: authHeaders() }
          );
          toast.success(data.message);
          fetchProfile();
        } catch (error: any) {
          toast.error(
            error.response?.data?.message ||
              "Failed to create rider profile"
          );
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setSubmitting(false);
      }
    );
  };

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    window.location.href = "/login";
    toast.success("Logged out");
  };

  const tabs: { id: TabId; label: string; icon: typeof BiGridAlt }[] = [
    { id: "overview", label: "Overview", icon: BiGridAlt },
    { id: "current", label: "Current", icon: BiPackage },
    { id: "history", label: "History", icon: BiHistory },
    { id: "profile", label: "Profile", icon: BiUser },
  ];

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-950" />
        <p className="text-sm text-gray-500">Loading rider dashboard…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-shell max-w-lg">
        <header className="mb-6">
          <p className="label-caps mb-2">Rider onboarding</p>
          <h1 className="page-title">Create your profile</h1>
          <p className="page-subtitle">
            Submit documents to start delivering with Gokart
          </p>
        </header>
        <div className="card space-y-4">
          <input
            type="number"
            placeholder="Aadhar number"
            value={aadharNumber}
            onChange={(e) => setaadharNumber(e.target.value)}
            className="input-field !mt-0"
          />
          <input
            type="number"
            placeholder="Contact number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="input-field !mt-0"
          />
          <input
            type="text"
            placeholder="Driving licence"
            value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            className="input-field !mt-0"
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-4 text-sm text-gray-600 transition hover:border-gray-900 hover:bg-gray-50">
            <BiUpload className="h-5 w-5 text-gray-700" />
            {image ? image.name : "Upload profile photo"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
          <button
            className="btn-primary w-full min-h-11"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting…" : "Submit profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <header className="glass-nav sticky top-0 z-40 border-b border-gray-200/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={profile.picture}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
            />
            <div>
              <p className="text-sm font-semibold text-gray-950">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {profile.isAvailble ? "Online" : "Offline"}
                {!profile.isVerified && " · Pending verification"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logoutHandler}
            className="icon-btn"
            title="Sign out"
          >
            <BiLogOut className="h-5 w-5" />
          </button>
        </div>

        <nav className="mx-auto flex max-w-lg gap-1 overflow-x-auto px-4 pb-2 sm:px-6 scrollbar-hide">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={
                activeTab === id
                  ? "chip-active flex shrink-0 items-center gap-1.5"
                  : "chip flex shrink-0 items-center gap-1.5"
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "current" && currentOrder && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="page-shell max-w-lg space-y-6 !py-6">
        {!audioUnlocked && activeTab === "overview" && (
          <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-950">Sound alerts</p>
              <p className="text-sm text-gray-500">
                Hear when a new delivery is available
              </p>
            </div>
            <button type="button" onClick={unlockAudio} className="btn-secondary shrink-0">
              Enable
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <>
            <section>
              <h2 className="page-title text-xl">Earnings & stats</h2>
              <p className="page-subtitle mb-4">
                Live summary of your deliveries on Gokart
              </p>
              <RiderStatsOverview stats={stats} loading={statsLoading} />
            </section>

            {profile.isVerified && !currentOrder && (
              <section className="card">
                <h3 className="font-semibold text-gray-950">Go online</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Stay within 500 m of a store hotspot to receive orders.
                </p>
                <button
                  type="button"
                  onClick={toggleAvailiblity}
                  disabled={toggling}
                  className={`btn-primary mt-4 w-full min-h-11 ${
                    profile.isAvailble ? "!bg-gray-600 hover:!bg-gray-700" : ""
                  }`}
                >
                  {toggling
                    ? "Updating…"
                    : profile.isAvailble
                    ? "Go offline"
                    : "Go online"}
                </button>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-950">Recent deliveries</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="text-sm font-medium text-gray-600 hover:text-gray-950"
                >
                  View all
                </button>
              </div>
              {historyLoading ? (
                <div className="space-y-3">
                  <div className="skeleton h-24 rounded-md" />
                  <div className="skeleton h-24 rounded-md" />
                </div>
              ) : history.length === 0 ? (
                <div className="card py-10 text-center text-sm text-gray-500">
                  No completed deliveries yet
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 3).map((order) => (
                    <RiderOrderHistoryItem key={order._id} order={order} compact />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "current" && (
          <>
            {profile.isAvailble && incomingOrders.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-semibold text-gray-950">Incoming requests</h3>
                {incomingOrders.map((id) => (
                  <RiderOrderRequest
                    key={id}
                    orderId={id}
                    onAccepted={() => {
                      fetchProfile();
                      refreshDashboard();
                      setActiveTab("current");
                    }}
                  />
                ))}
              </section>
            )}

            {currentOrder ? (
              <section className="space-y-4">
                <RiderCurrentOrder
                  order={currentOrder}
                  onStatusUpdate={refreshDashboard}
                />
                <RiderOrderMap order={currentOrder} />
              </section>
            ) : (
              <div className="card py-12 text-center">
                <BiPackage className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-medium text-gray-950">No active order</p>
                <p className="mt-1 text-sm text-gray-500">
                  {profile.isAvailble
                    ? "Waiting for nearby delivery requests…"
                    : "Go online from Overview to receive orders"}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <section className="space-y-4">
            <div>
              <h2 className="page-title text-xl">Delivery history</h2>
              <p className="page-subtitle">
                {historyPagination
                  ? `${historyPagination.total} completed deliveries`
                  : "Past orders"}
              </p>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-28 rounded-md" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="card py-12 text-center text-sm text-gray-500">
                Complete your first delivery to see history here
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((order) => (
                  <RiderOrderHistoryItem key={order._id} order={order} />
                ))}
              </div>
            )}

            {historyPagination && historyPagination.pages > 1 && (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={historyPage <= 1 || historyLoading}
                  onClick={() => fetchHistory(historyPage - 1)}
                  className="btn-secondary flex-1"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {historyPage} / {historyPagination.pages}
                </span>
                <button
                  type="button"
                  disabled={
                    historyPage >= historyPagination.pages || historyLoading
                  }
                  onClick={() => fetchHistory(historyPage + 1)}
                  className="btn-secondary flex-1"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "profile" && (
          <section className="space-y-4">
            <div className="card text-center">
              <img
                src={profile.picture}
                alt=""
                className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-gray-100"
              />
              <h2 className="mt-4 text-lg font-semibold text-gray-950">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.isVerified
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profile.isVerified ? "Verified" : "Verification pending"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.isAvailble
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profile.isAvailble ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="card space-y-3 text-sm">
              <h3 className="font-semibold text-gray-950">Account details</h3>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">
                  {profile.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <span className="text-gray-500">Aadhar</span>
                <span className="font-medium text-gray-900">
                  •••• {String(profile.aadharNumber).slice(-4)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Driving licence</span>
                <span className="font-medium text-gray-900">
                  {profile.drivingLicenseNumber}
                </span>
              </div>
            </div>

            <div className="card space-y-2 text-sm text-gray-600">
              <h3 className="font-semibold text-gray-950">How you earn</h3>
              <p>₹17 per km (distance rounded up) per completed delivery.</p>
              <p>
                Customer delivery fee (₹49 or free over ₹250) and platform fee
                (₹7) are separate from your payout.
              </p>
            </div>

            {profile.isVerified && !currentOrder && (
              <button
                type="button"
                onClick={toggleAvailiblity}
                disabled={toggling}
                className="btn-primary w-full min-h-11"
              >
                {toggling
                  ? "Updating…"
                  : profile.isAvailble
                  ? "Go offline"
                  : "Go online"}
              </button>
            )}

            <button
              type="button"
              onClick={logoutHandler}
              className="btn-secondary w-full min-h-11 gap-2"
            >
              <BiLogOut size={18} />
              Sign out
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;
