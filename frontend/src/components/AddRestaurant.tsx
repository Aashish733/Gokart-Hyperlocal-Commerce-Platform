import { useState, useEffect } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";
import LocationModal from "./LocationModal";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location: contextLocation } = useAppData();
  const [localLocation, setLocalLocation] = useState<any>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const location = localLocation || contextLocation;

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All fields are required (including location)");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Added successfully");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
        <h1 className="text-xl font-semibold">Add Your Restaurant</h1>
        <input
          type="text"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />
        <input
          type="number"
          placeholder="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />
        <textarea
          placeholder="Restaurant Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
          <BiUpload className="h-5 w-5 text-red-500" />
          {image ? image.name : "Upload restaurant image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div
          onClick={() => setIsMapOpen(true)}
          className="flex items-start justify-between gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition border-gray-200"
        >
          <div className="flex items-start gap-3">
            <BiMapPin className="mt-0.5 h-5 w-5 text-[#e23744]" />
            <div className="text-sm text-gray-700">
              {loadingLocation ? (
                <span className="text-gray-400">Fetching your location...</span>
              ) : location ? (
                <span>{location.formattedAddress}</span>
              ) : (
                <span className="text-red-500 font-medium">Click to select location on map *</span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400 hover:text-[#e23744] underline shrink-0 transition mt-0.5">
            Change
          </span>
        </div>

        <button
          className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744] hover:bg-[#c12e3a] transition-all"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Add Restaurant"}
        </button>
      </div>

      <LocationModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialLatitude={location?.latitude}
        initialLongitude={location?.longitude}
        onConfirm={(lat, lng, address) => {
          setLocalLocation({
            latitude: lat,
            longitude: lng,
            formattedAddress: address,
          });
        }}
      />
    </div>
  );
};

export default AddRestaurant;
