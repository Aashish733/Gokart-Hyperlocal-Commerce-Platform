import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { storeService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";
import LocationModal from "./LocationModal";

interface props {
  fetchMyStore: () => Promise<void>;
}

const AddStore = ({ fetchMyStore }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("food");
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
    formData.append("serviceType", serviceType);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${storeService}/api/store/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Store Added successfully");
      fetchMyStore();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="page-shell max-w-lg">
      <header className="mb-6">
        <p className="label-caps mb-2">Partner</p>
        <h1 className="page-title">Add your store</h1>
      </header>

      <div className="card space-y-5">
        <input
          type="text"
          placeholder="Store name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field !mt-0"
        />
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="input-field !mt-0 bg-white"
        >
          <option value="food">Food Delivery</option>
          <option value="grocery">Grocery</option>
          <option value="utensils">Utensils</option>
          <option value="clothes">Clothes</option>
          <option value="electronics">Electronics</option>
        </select>
        <input
          type="number"
          placeholder="Contact Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field !mt-0"
        />
        <textarea
          placeholder="Store Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field !mt-0 min-h-[100px] resize-y"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-4 text-sm text-gray-600 transition hover:border-gray-900 hover:bg-gray-50">
          <BiUpload className="h-5 w-5 text-gray-700" />
          {image ? image.name : "Upload store image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <div
          onClick={() => setIsMapOpen(true)}
          className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-gray-200 p-4 transition hover:border-gray-900 hover:bg-gray-50"
        >
          <div className="flex items-start gap-3">
            <BiMapPin className="mt-0.5 h-5 w-5 text-gray-700" />
            <div className="text-sm text-gray-700">
              {loadingLocation ? (
                <span className="text-gray-400">Fetching your location...</span>
              ) : location ? (
                <span>{location.formattedAddress}</span>
              ) : (
                <span className="font-medium text-gray-900">Click to select location on map *</span>
              )}
            </div>
          </div>
          <span className="mt-0.5 shrink-0 text-xs text-gray-500 underline transition hover:text-gray-900">
            Change
          </span>
        </div>

        <button
          className="btn-primary w-full"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Add Store"}
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

export default AddStore;
