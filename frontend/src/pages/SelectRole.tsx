import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

type Role = "customer" | "rider" | "seller" | null;
const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      alert("something went wrong");
      console.log(error);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">Choose your role</h1>

        <div className="space-y-4">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`
                    w-full rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                      role === r
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-black"
                    }
                    `}
            >
              Continue as {r}
            </button>
          ))}
        </div>
        <button
          disabled={!role}
          onClick={addRole}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            role
              ? "bg-black text-white hover:bg-gray-900"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectRole;
