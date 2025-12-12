import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  FileText,
  User,
} from "lucide-react";

import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateName = (name) => {
    if (!name) return "Please enter your name.";
    if (name.length < 2) return "Name should be at least 2 characters";
    if (name.length > 50) return "Name must be less than 50 characters";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";

    return "";
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    //Real-time validation:
    if (touched[name]) {
      const newFieldErrors = { ...fieldErrors };
      if (name === "name") {
        newFieldErrors.name = validateName(value);
      } else if (name === "email") {
        newFieldErrors.email = validateEmail(value);
      } else if (name === "password") {
        newFieldErrors.password = validatePassword(value);

        if (touched.confirmPassword) {
          newFieldErrors.confirmPassword = validateConfirmPassword(
            formData.confirmPassword,
            value
          );
        }
      } else if (name === "confirmPassword") {
        newFieldErrors.confirmPassword = validateConfirmPassword(
          value,
          formData.password
        );
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
    if (name === "name") {
      newFieldErrors.name = validateName(formData.name);
    } else if (name === "email") {
      newFieldErrors.email = validateEmail(formData.email);
    } else if (name === "password") {
      newFieldErrors.password = validatePassword(formData.password);
    } else if (name === "confirmPassword") {
      newFieldErrors.confirmPassword = validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      );
    }
    setFieldErrors(newFieldErrors);
  };

  // Form Validity Check
  const isFormValid = () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    return (
      !emailError &&
      !nameError &&
      !passwordError &&
      !confirmPasswordError &&
      formData.email &&
      formData.password &&
      formData.name &&
      formData.confirmPassword
    );
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setFieldErrors({
        name:nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError
      });
      setTouched({
        name:true,
        email: true,
        password: true,
        confirmPassword: true
      });
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name:formData.name,
        email:formData.email,
        password:formData.password,
       
      });

      const data = response.data;
      const {token, user} = data;

      if (response.status === 201) {
        setSuccess("Account created successfully");

        setFormData({
          name:"",
          email:"",
          password:"",
          confirmPassword:"",
         
        })
        
        setTouched({
          name:false,
          email:false,
          password:false,
          confirmPassword:false,
          
        })
        //login the user immediately after successful registration:
        login(user, token);
        navigate("/dashboard");
      }
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again");
      }
      console.error("API error: ", err.response || err);
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

          <h1 className="text-2xl font-bold"> Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join Invoice Generator today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="font-medium">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg pl-12 pr-4 py-3 outline-none transition-all ${
                  fieldErrors.name && touched.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />
            </div>
            {fieldErrors.name && touched.name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/*EMAIL */}

          <div>
            <label className="font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
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

          {/*PASSWORD */}

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

          {/*CONFIRM PASSWORD */}

          <div>
            <label className="font-medium">Confirm Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password "
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg pl-12 pr-12 py-3 outline-none transition-all ${
                  fieldErrors.confirmPassword && touched.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-black"
                }`}
              />

              <button
                type="button"
                className="absolute right-3 top-3 text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          {/*ERROR/SUCCESS MESSAGES */}
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
          {/*TERMS AND CONDITIONS */}
          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-black border-b-gray-300 rounded focus:ring-black mt-1"
              required
            />

            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <button type="button" className="text-black hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-black hover:underline">
                Privacy Policy
              </button>
            </label>
          </div>
          {/* Sign Up Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-blue-950 to-blue-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition "
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        {/* Footer*/}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              className="text-blue-900 hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
