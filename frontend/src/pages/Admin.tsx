import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminStoreCard from "../components/AdminStoreCard";
import RiderAdmin from "../components/RiderAdmin";

const Admin = () => {
  const [store, setStore] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"store" | "rider">("store");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/store/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("the fetch datavus",data)
      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStore(data.stores);
      setRiders(response.data.riders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setTab("store")}
          className={`px-4 py-2 rounded ${
            tab === "store" ? "bg-black text-white" : "border border-gray-200 bg-white text-gray-700"
          }`}
        >
          Store
        </button>

        <button
          onClick={() => setTab("rider")}
          className={`px-4 py-2 rounded ${
            tab === "rider" ? "bg-black text-white" : "border border-gray-200 bg-white text-gray-700"
          }`}
        >
          Riders
        </button>
      </div>

      {tab === "store" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {store.length === 0 ? (
            <p>No pending stores</p>
          ) : (
            store.map((r) => (
              <AdminStoreCard
                key={r._id}
                store={r}
                onVerify={fetchData}
              />
            ))
          )}
        </div>
      )}
      {tab === "rider" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {riders.length === 0 ? (
            <p>No pending riders</p>
          ) : (
            riders.map((r) => (
              <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
