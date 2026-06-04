import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage, BiChevronRight } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("logout Success");
  };

  const menuItems = [
    { icon: BiPackage, label: "Your orders", path: "/orders" },
    { icon: BiMapPin, label: "Saved addresses", path: "/address" },
  ];

  return (
    <div className="page-shell max-w-lg">
      <header className="mb-8">
        <p className="label-caps mb-2">Profile</p>
        <h1 className="page-title">Account</h1>
      </header>

      <div className="card-elevated overflow-hidden p-0">
        <div className="flex items-center gap-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-950 text-2xl font-semibold text-white shadow-lg">
            {firstLetter}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-950">{user?.name}</h2>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-gray-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Icon className="h-5 w-5 text-gray-800" />
              </span>
              <span className="flex-1 font-medium text-gray-900">{label}</span>
              <BiChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}

          <button
            type="button"
            onClick={logoutHandler}
            className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-gray-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <BiLogOut className="h-5 w-5 text-gray-800" />
            </span>
            <span className="flex-1 font-medium text-gray-900">Sign out</span>
            <BiChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
