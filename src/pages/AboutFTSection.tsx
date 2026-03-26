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
            <title>About Us | Mwananchi Communications - Leading Media Company in Tanzania</title>
            <meta 
              name="description" 
              content={aboutContent ? aboutContent.description.slice(0, 155) : "Leading digital multimedia company in Tanzania, shaping the future of media with innovation and integrity."} 
            />
            <meta name="keywords" content="media, tanzania, digital, multimedia, news, brands, mwananchi, communication" />
            <meta property="og:title" content="About Us | Mwananchi Communications" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={window.location.href} />
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
        <div className="min-h-screen bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default memo(AboutFTSection);