import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IStore } from "../types";
import axios from "axios";
import { storeService } from "../main";
import StoreProfile from "../components/StoreProfile";
import MenuItems from "../components/MenuItems";

const StorePage = () => {
  const { id } = useParams();

  const [store, setStore] = useState<IStore | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    try {
      const { data } = await axios.get(
        `${storeService}/api/store/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStore(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${storeService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStore();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading store...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">No Store with this id</p>
      </div>
    );
  }
  return (
    <div className="page-shell space-y-8">
      <StoreProfile
        store={store}
        onUpdate={setStore}
        isSeller={false}
      />

      <div>
        <p className="label-caps mb-4">Menu</p>
        <div className="card !p-4 sm:!p-5">
        <MenuItems
          isSeller={false}
          items={menuItems}
          onItemDeleted={() => {}}
        />
        </div>
      </div>
    </div>
  );
};

export default StorePage;
