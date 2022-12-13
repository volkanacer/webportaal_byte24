import axios from "axios";
import * as React from "react";
import { toast } from "react-toastify";
import { API_URL } from "../../constants";
import { useForm } from "react-hook-form";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onForgotSubmit = async (data) => {
    const forgotReqConfig = {
      email: data.email.toLowerCase(),
    };

    try {
      const forgotRequest = await axios.post(
        `${API_URL}/werknemer/forgot-password`,
        forgotReqConfig
      );

      toast.success(forgotRequest.data.msg);
    } catch {
      (err) => {
        toast.error(forgotRequest.response.data.msg);
      };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src={require("../../assets/logo.png")}
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recover Password
          </h2>
          <form
            action="#"
            onSubmit={handleSubmit(onForgotSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <h3 className="mt-6 mb-8">
                Enter your email address to receive a password reset email.
              </h3>
              <input
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                type="email"
                placeholder="Email address"
                {...register("email", { required: true })}
              />
              {errors.email?.type === "required" && (
                <p className="text-sm text-red-600 font-bold italic mb-4">
                  * Email is required.
                </p>
              )}
            </div>
            <div className="text-sm text-right">
              <a
                href="/login"
                className="font-medium text-blue-800 hover:text-blue-700 "
              >
                Back to the login screen
              </a>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
