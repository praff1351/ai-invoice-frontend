import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  FileText,
} from "lucide-react";

import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (touched[name]) {
      const newFieldErrors = { ...fieldErrors };
      if (name === "email") {
        newFieldErrors.email = validateEmail(value);
      } else if (name === "password") {
        newFieldErrors.password = validatePassword(value);
      }
      setFieldErrors(newFieldErrors);
    }
    if (error) setError("");
  };

  // Handle blur validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    //validate on blur:
    const newFieldErrors = { ...fieldErrors };
    if (name === "email") {
      newFieldErrors.email = validateEmail(formData.email);
    } else if (name === "password") {
      newFieldErrors.password = validatePassword(formData.password);
    }
    setFieldErrors(newFieldErrors);
  };

  // Form Validity Check
  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    return !emailError && !passwordError && formData.email && formData.password;
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      setTouched({
        email: true,
        password: true,
      });
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      const data = response.data;
      const { token, user } = data;
      console.log(data);

      if (token) {
        setSuccess("Logged In successfully");

        setFormData({
          email: "",
          password: "",
        });
        setTouched({
          email: false,
          password: false,
        });

        
        login(user, token);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-900 to-blue-950 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <FileText className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold">Login to your Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back to Invoice Generator
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg pl-12 pr-4 py-3 outline-none transition-all ${
                  fieldErrors.email && touched.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
            </div>
            {fieldErrors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="font-medium">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg pl-12 pr-12 py-3 outline-none transition-all ${
                  fieldErrors.password && touched.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />

              <button
                type="button"
                className="absolute right-3 top-3 text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {fieldErrors.password && touched.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* ERROR & SUCCESS */}
          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded-md text-center text-sm">
              <p className="">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-600 p-2 rounded-md text-center text-sm">
              <p className="">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-blue-950 to-blue-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Signing in...
              </>
            ) : (
              <>
                Login
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <button
            className="text-blue-900 hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
