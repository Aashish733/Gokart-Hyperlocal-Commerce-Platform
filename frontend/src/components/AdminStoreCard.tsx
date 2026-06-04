import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";

const AdminStoreCard = ({
  store,
  onVerify,
}: {
  store: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/store/${store._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Store verified");
      onVerify();
    } catch (error) {
      toast.error("failed ot verify store");
    }
  };
  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
      <img
        src={store.image}
        className="h-40 w-full object-cover rounded"
        alt=""
      />
      <h3>{store.name}</h3>
      <p className="text-sm text-gray-500">{store.phone}</p>
      <p>{store.autoLocation?.formattedAddress}</p>

      <button
        className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600"
        onClick={verify}
      >
        Verify Store
      </button>
    </div>
  );
};

export default AdminStoreCard;
