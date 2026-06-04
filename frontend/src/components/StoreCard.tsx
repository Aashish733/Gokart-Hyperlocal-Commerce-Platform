import { useNavigate } from "react-router-dom";
import { BiNavigation } from "react-icons/bi";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const StoreCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/store/${id}`)}
      className={`group cursor-pointer overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md ${
        !isOpen ? "opacity-90" : ""
      }`}
      onClick={() => navigate(`/store/${id}`)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={image}
          alt=""
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            !isOpen ? "grayscale" : ""
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur-sm">
            <BiNavigation className="h-3 w-3" />
            {distance} km
          </span>
          {isOpen ? (
            <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Open
            </span>
          ) : (
            <span className="rounded-full bg-gray-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Closed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5 p-4 pt-3">
        <h3 className="truncate text-[15px] font-semibold tracking-tight text-gray-950 group-hover:text-black">
          {name}
        </h3>
        <p className="text-xs text-gray-500">Tap to view menu</p>
      </div>
    </article>
  );
};

export default StoreCard;
