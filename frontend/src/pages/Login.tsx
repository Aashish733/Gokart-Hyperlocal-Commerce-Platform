import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    try {
      const schema = isLogin ? loginSchema : registerSchema;
      const partialData = { ...formData, [name]: value };
      schema.parse(partialData);
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues.find((e) => e.path[0] === name);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [name]: fieldError.message }));
        } else {
          setErrors((prev) => ({ ...prev, [name]: "" }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const schema = isLogin ? loginSchema : registerSchema;
      schema.parse(formData);

      const endpoint = isLogin ? "/api/auth/login/email" : "/api/auth/register";
      const { data } = await axios.post(`${authService}${endpoint}`, formData);

      localStorage.setItem("token", data.token);
      toast.success(data.message);
      setUser(data.user);
      setIsAuth(true);
      navigate("/");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        err.issues.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setErrors(newErrors);
        toast.error("Please fix the errors");
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Authentication failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const responseGoogle = async (authResult: any) => {
    try {
      setLoading(true);
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login with Google");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card-elevated w-full max-w-[420px] p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-lg font-bold text-white shadow-lg">
            G
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isLogin
              ? "Sign in to order from stores near you"
              : "Join Gokart in under a minute"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="label-caps">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? "input-field-error" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="field-error">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="label-caps">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`input-field ${errors.email ? "input-field-error" : ""}`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="label-caps">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`input-field ${errors.password ? "input-field-error" : ""}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Processing…" : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium text-gray-400">
              or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="btn-secondary w-full gap-3 py-3"
        >
          <FcGoogle size={20} />
          Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "New to Gokart? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="font-semibold text-gray-950 underline-offset-4 hover:underline"
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
