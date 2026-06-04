import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { BiSearch, BiTargetLock, BiX, BiMapPin, BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";

// 🔧 Fix leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onConfirm: (lat: number, lng: number, address: string, city: string) => void;
}

// 📍 Click handler to select coordinates on map
const LocationPicker = ({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// 🗺 Map panning controller
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

// 🎯 Locate Me component
const LocateMe = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied. Please allow location.")
    );
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-4 right-4 z-1000 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:border-black hover:text-black"
      title="Use Current Location"
    >
      <BiTargetLock size={22} className="animate-pulse" />
    </button>
  );
};

export default function LocationModal({
  isOpen,
  onClose,
  initialLatitude,
  initialLongitude,
  onConfirm,
}: LocationModalProps) {
  // Default coordinates (e.g., Delhi, India)
  const defaultLat = 28.6139;
  const defaultLng = 77.209;

  const [lat, setLat] = useState<number>(initialLatitude || defaultLat);
  const [lng, setLng] = useState<number>(initialLongitude || defaultLng);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  // Search Address State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Run reverse geocoding to find address details when lat/lng change
  const fetchAddressDetails = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      setAddress(data.display_name || "Custom location marker");

      const cityName =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        "Your Location";
      setCity(cityName);
    } catch (err) {
      console.error(err);
      toast.error("Failed to retrieve address details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const newLat = initialLatitude || defaultLat;
      const newLng = initialLongitude || defaultLng;
      setLat(newLat);
      setLng(newLng);
      fetchAddressDetails(newLat, newLng);
    }
  }, [isOpen, initialLatitude, initialLongitude]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data || []);
    } catch {
      toast.error("Error searching location");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (sug: any) => {
    const newLat = parseFloat(sug.lat);
    const newLng = parseFloat(sug.lon);
    setLat(newLat);
    setLng(newLng);
    setAddress(sug.display_name);

    const addressParts = sug.address || {};
    const cityName =
      addressParts.city ||
      addressParts.town ||
      addressParts.village ||
      addressParts.suburb ||
      "Your Location";
    setCity(cityName);

    setSuggestions([]);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    if (!address) {
      toast.error("Waiting for location details...");
      return;
    }
    onConfirm(lat, lng, address, city);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="card-elevated relative flex max-h-[min(92vh,600px)] h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-md p-0 transition-all duration-300 sm:h-[92vh] sm:max-h-[600px] sm:rounded-md">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <BiMapPin className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-semibold text-gray-800">
              Select Location on Map
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <BiX size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative px-6 py-3 border-b bg-gray-50 z-20">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search for your street, city, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black"
              />
              <BiSearch className="absolute left-3.5 top-2.5 text-gray-400 h-4.5 w-4.5" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="btn-primary shrink-0"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-6 right-6 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-white shadow-lg">
              {suggestions.map((sug) => (
                <div
                  key={sug.place_id}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="flex items-start gap-2 cursor-pointer px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 border-b last:border-0 transition"
                >
                  <BiMapPin className="text-gray-400 mt-0.5 shrink-0" />
                  <span>{sug.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Body */}
        <div className="relative flex-1 bg-gray-100 z-10">
          <MapContainer
            center={[lat, lng]}
            zoom={14}
            className="h-full w-full"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationPicker onSelect={(latitude, longitude) => {
              setLat(latitude);
              setLng(longitude);
              fetchAddressDetails(latitude, longitude);
            }} />
            <LocateMe onLocate={(latitude, longitude) => {
              setLat(latitude);
              setLng(longitude);
              fetchAddressDetails(latitude, longitude);
            }} />
            <MapController center={[lat, lng]} />
            <Marker position={[lat, lng]} />
          </MapContainer>
        </div>

        {/* Footer Detail Section */}
        <div className="border-t bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full text-center sm:text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Selected Address
            </p>
            <div className="mt-1 flex items-start justify-center sm:justify-start gap-2">
              {loading ? (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 py-1">
                  <BiLoaderAlt className="animate-spin text-gray-900" />
                  <span>Fetching address details...</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">
                  📍 {address || "No address selected yet"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading || !address}
            className="btn-primary w-full sm:w-auto min-h-11 px-6"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
