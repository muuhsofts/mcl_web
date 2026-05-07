import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import VisionMissionSection from "./homeComponents/VisionMissionSection";

import Footer from "../components/Footer";   
import Header from "../components/header/Header";

const VisionMissionPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 font-inter flex flex-col">
      {/* Soft decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-50/40 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* Main content: grows, centers section, and adds vertical spacing */}
      <main className="flex-grow flex items-center justify-center relative z-10 py-12 md:py-16 lg:py-20">
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="group flex items-center gap-2 bg-white/70 backdrop-blur-md hover:bg-white text-gray-700 font-medium py-2.5 px-5 rounded-full border border-gray-200/50 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back Home</span>
          </Link>
        </div>

        <VisionMissionSection />
      </main>

      <Footer />
    </div>
  );
};

export default VisionMissionPage;