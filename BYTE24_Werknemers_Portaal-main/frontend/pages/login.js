import axios from "axios";
import * as React from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { API_URL } from "../constants";
import nookies from "nookies";

toast.configure();
export default function Login() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const adminLogin = async (login) => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, login);
      console.log(response.data);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      nookies.set({}, "jwt", response.data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      toast.success("Login Successful!");
      router.push("/admin");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data.msg);
    }
  };

  const onSubmit = async (data) => {
    try {
      const loginWerknemer = {
        email: data.email.toLowerCase(),
        password: data.password,
      };

      await axios
        .post(`${API_URL}/werknemer/login`, loginWerknemer)
        .then((response) => {
          console.response;
          localStorage.setItem("user", JSON.stringify(response.data.user));
          nookies.set({}, "jwt", response.data.token, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });
          toast.success("Login Successful!");
          router.push("../medewerker/");
        })
        .catch((err) => {
          adminLogin(loginWerknemer);
        });
    } catch {
      (err) => {
        toast.error(err.response.data.msg);
      };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src={require("../assets/logo.png")}
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  {...register("email", { required: true })}
                />{" "}
                {errors.email?.type === "required" && (
                  <p className="text-sm text-red-600 font-bold italic mb-4">
                    * Email is required.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
                {errors.password?.type === "required" && (
                  <p className="text-sm text-red-600 font-bold italic mb-4">
                    * Password is required.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="/"
                  className="font-medium text-blue-800 hover:text-blue-700"
                >
                  Back to Home
                </a>
              </div>

              <div className="text-sm">
                <a
                  href="../medewerker/forgot-password"
                  className="font-medium text-blue-800 hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
