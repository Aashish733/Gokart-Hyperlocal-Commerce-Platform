import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";
import LocationModal from "./LocationModal";

const Navbar = () => {
  const { isAuth, city, setCity, location, setLocation, quauntity } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105">
            G
          </span>
          <span className="text-xl font-semibold tracking-tight text-gray-950 sm:text-[1.35rem]">
            Gokart
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/cart" className="icon-btn relative">
            <CgShoppingCart className="h-5 w-5" />
            {quauntity > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-950 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {quauntity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link to="/account" className="btn-secondary hidden px-4 py-2 sm:inline-flex">
              Account
            </Link>
          ) : (
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="border-t border-gray-100/80 px-4 pb-4 pt-3 sm:px-6 md:px-8">
          <div className="mx-auto flex max-w-7xl items-center overflow-hidden rounded-md border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="flex min-h-12 items-center gap-2 border-r border-gray-100 px-4 py-2.5 transition hover:bg-gray-50"
              title="Change location"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <BiMapPin className="h-4 w-4 text-gray-800" />
              </span>
              <span className="max-w-[7rem] truncate text-left text-sm font-medium text-gray-800 sm:max-w-[10rem]">
                {city || "Set location"}
              </span>
            </button>
            <div className="flex min-h-12 flex-1 items-center gap-3 px-4">
              <BiSearch className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores, cuisines, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      <LocationModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialLatitude={location?.latitude}
        initialLongitude={location?.longitude}
        onConfirm={(lat, lng, address, cityName) => {
          setLocation({
            latitude: lat,
            longitude: lng,
            formattedAddress: address,
          });
          setCity(cityName);
        }}
      />
    </header>
  );
};

export default Navbar;
