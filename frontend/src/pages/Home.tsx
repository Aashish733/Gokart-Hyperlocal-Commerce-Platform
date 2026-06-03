import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import LocationModal from "../components/LocationModal";
import { BiMapPin } from "react-icons/bi";

const Home = () => {
  const { location, loadingLocation, setLocation, setCity } = useAppData();
  const [searchParams] = useSearchParams();
  const [isMapOpen, setIsMapOpen] = useState(false);

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
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

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loadingLocation) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E23744] border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Detecting your location...</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4 max-w-md mx-auto space-y-6">
        <div className="rounded-full bg-red-50 p-5 text-[#E23744] shadow-inner">
          <BiMapPin size={42} className="animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Location Access Required</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We need your delivery location to show you restaurants and delivery options available in your area.
          </p>
        </div>
        <button
          onClick={() => setIsMapOpen(true)}
          className="rounded-xl bg-[#E23744] hover:bg-[#c12e3a] text-white px-6 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all w-full"
        >
          Set Location Manually
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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Finding restaurants near you...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {restaurants.map((res) => {
            const [resLng, resLat] = res.autoLocation.coordinates;

            const distance = getDistanceKm(
              location.latitude,
              location.longitude,
              resLat,
              resLng
            );

            return (
              <RestaurantCard
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
      ) : (
        <p className="text-center text-gray-500">No restaurant found</p>
      )}
    </div>
  );
};

export default Home;
