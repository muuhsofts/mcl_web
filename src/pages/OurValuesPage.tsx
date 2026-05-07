import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axios";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import { ValueData } from "./components/about/aboutCommon"; 
import OurValuesSection from "./components/about/OurValuesSection";

const OurValuesPage: React.FC = () => {
  const [values, setValues] = useState<ValueData[]>([]);

  useEffect(() => {
    const loadValues = async () => {
      try {
        const response = await axiosInstance.get<{ values: ValueData[] }>("/api/values/all");
        if (Array.isArray(response.data.values)) {
          setValues(response.data.values);
        } else {
          throw new Error("Invalid values data");
        }
      } catch (error) {
        console.error("Failed to fetch company values:", error);
        toast.error("Failed to fetch company values.");
      }
    };
    loadValues();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 font-inter flex flex-col">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-50/40 rounded-full blur-3xl pointer-events-none" />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Header />

      <main className="flex-grow flex items-center justify-center relative z-10 py-12 md:py-16 lg:py-20">
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="group flex items-center gap-2 bg-white/70 backdrop-blur-md hover:bg-white text-gray-700 font-medium py-2.5 px-5 rounded-full border border-gray-200/50 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back Home</span>
          </Link>
        </div>

        <OurValuesSection values={values} />
      </main>

      <Footer />
    </div>
  );
};

export default OurValuesPage;