import { lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import SimpleLoader from "./homeComponents/SimpleLoader";
import HeroSection from "./homeComponents/HeroSection";
import AboutSection from "./homeComponents/AboutSection";
import VisionMissionSection from "./homeComponents/VisionMissionSection";
import ValuesSection from "./homeComponents/ValuesSection";
import DiscoverCards from "./homeComponents/DiscoverCards";
import ValueModal from "./homeComponents/ValueModal";

// Custom hooks and utilities
import { useAboutData } from "./homeComponents/useAboutData";

// Lazy load heavy components
const Footer = lazy(() => import("../components/Footer"));

const AboutFTSection = () => {
  const {
    isLoading,
    sliderData,
    subscriptions,
    aboutContent,
    values,
    cards,
    error,
    selectedValue,
    handleValueClick,
    handleCloseModal,
  } = useAboutData();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Helmet>
          <title>Error | Tanzania's Leading Media Company - Mwananchi Communications</title>
          <meta name="description" content="Page temporarily unavailable. Please refresh or try again later." />
        </Helmet>
        <div className="text-center bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white text-lg mb-6 font-sans">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 text-white rounded-full text-base font-semibold bg-gradient-to-r from-[#007aff] to-[#FF3520] hover:shadow-xl transition-all font-sans"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
      
      <AnimatePresence mode="wait">
        {isLoading && <SimpleLoader />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedValue && (
          <ValueModal value={selectedValue} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {!isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Helmet>
            {/* Primary SEO Title - Updated for better performance */}
            <title>Tanzania's Leading Media Company | About Mwananchi Communications</title>
            
            {/* Meta Description */}
            <meta 
              name="description" 
              content={aboutContent ? aboutContent.description.slice(0, 155) : "Tanzania's leading digital multimedia company delivering trusted news, innovative media solutions, and exceptional content across all platforms. Discover our story, mission, and values."} 
            />
            
            {/* Keywords */}
            <meta 
              name="keywords" 
              content="leading media company Tanzania, Mwananchi Communications, digital media Tanzania, Tanzanian news, multimedia company, East African media, media house Tanzania, best media company Tanzania" 
            />
            
            {/* Canonical URL */}
            <link rel="canonical" href={window.location.href} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Tanzania's Leading Media Company | About Mwananchi Communications" />
            <meta property="og:description" content={aboutContent ? aboutContent.description.slice(0, 155) : "Tanzania's leading digital multimedia company delivering trusted news, innovative media solutions, and exceptional content."} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:site_name" content="Mwananchi Communications" />
            <meta property="og:locale" content="en_TZ" />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Tanzania's Leading Media Company | About Mwananchi Communications" />
            <meta name="twitter:description" content={aboutContent ? aboutContent.description.slice(0, 155) : "Tanzania's leading digital multimedia company delivering trusted news and innovative media solutions."} />
            
            {/* Additional SEO Meta Tags */}
            <meta name="author" content="Mwananchi Communications" />
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            {/* Geo Tags */}
            <meta name="geo.region" content="TZ" />
            <meta name="geo.placename" content="Dar es Salaam" />
            <meta name="geo.position" content="-6.792354;39.208328" />
            <meta name="ICBM" content="-6.792354, 39.208328" />
          </Helmet>

          <HeroSection data={sliderData} subscriptions={subscriptions} />
          
          <main>
            <AboutSection content={aboutContent} />
            <VisionMissionSection />
            <ValuesSection values={values} onCardClick={handleValueClick} />
            <DiscoverCards cards={cards} />
          </main>
          
          <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse" />}>
            <Footer />
          </Suspense>
        </motion.div>
      ) : (
        <div className="min-h-screen bg-gray-100 animate-pulse">
          <Helmet>
            <title>Loading... | Tanzania's Leading Media Company - Mwananchi Communications</title>
          </Helmet>
        </div>
      )}
    </div>
  );
};

export default memo(AboutFTSection);