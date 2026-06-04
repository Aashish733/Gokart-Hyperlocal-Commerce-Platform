import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IStore } from "../types";
import axios from "axios";
import { storeService } from "../main";
import StoreCard from "../components/StoreCard";
import LocationModal from "../components/LocationModal";
import { BiMapPin } from "react-icons/bi";

const CATEGORIES = [
  { id: "food", label: "Food" },
  { id: "grocery", label: "Grocery" },
  { id: "utensils", label: "Utensils" },
  { id: "clothes", label: "Fashion" },
  { id: "electronics", label: "Tech" },
];

const StoreSkeleton = () => (
  <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div className="skeleton aspect-[4/3] w-full rounded-none" />
    <div className="space-y-2 p-4">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  </div>
);

const Home = () => {
  const { location, loadingLocation, setLocation, setCity } = useAppData();
  const [searchParams] = useSearchParams();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const [serviceType, setServiceType] = useState<string>("food");

  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchStores = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(`${storeService}/api/store/all`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          search,
          serviceType,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStores(data.stores ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [location, search, serviceType]);

  if (loadingLocation) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-950" />
        <p className="text-sm font-medium text-gray-500">Finding your location…</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="page-shell flex min-h-[55vh] flex-col items-center justify-center text-center">
        <div className="card-elevated mb-8 flex h-20 w-20 items-center justify-center rounded-2xl">
          <BiMapPin size={36} className="text-gray-800" />
        </div>
        <h2 className="page-title">Where should we deliver?</h2>
        <p className="page-subtitle mx-auto mt-2 max-w-sm">
          Set your location once to unlock stores, delivery times, and checkout in
          your area.
        </p>
        <button
          onClick={() => setIsMapOpen(true)}
          className="btn-primary mt-8 min-w-[220px]"
        >
          Choose location
        </button>

        <LocationModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onConfirm={(lat, lng, address, cityName) => {
            setLocation({
              latitude: lat,
              longitude: lng,
              formattedAddress: address,
            });
            setCity(cityName);
          }}
        />
      </div>
    );
  }

  const activeLabel =
    CATEGORIES.find((c) => c.id === serviceType)?.label ?? "Stores";

  return (
    <div className="page-shell">
      <header className="mb-8">
        <p className="label-caps mb-2">Deliver to you</p>
        <h1 className="page-title">Explore nearby</h1>
        <p className="page-subtitle">
          Curated {activeLabel.toLowerCase()} stores — fast delivery, transparent pricing.
        </p>
      </header>

      <div className="scrollbar-hide -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setServiceType(cat.id)}
            className={serviceType === cat.id ? "chip-active" : "chip"}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StoreSkeleton key={i} />
          ))}
        </div>
      ) : stores.length > 0 ? (
        <>
          <p className="label-caps mb-4">
            {stores.length} {stores.length === 1 ? "store" : "stores"} available
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stores.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;
              const distance = getDistanceKm(
                location.latitude,
                location.longitude,
                resLat,
                resLng
              );

              return (
                <StoreCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image ?? ""}
                  distance={`${distance}`}
                  isOpen={res.isOpen}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="card-elevated mx-auto max-w-md py-16 text-center">
          <p className="text-lg font-semibold text-gray-950">No stores yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Try another category or update your search — new partners join daily.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
