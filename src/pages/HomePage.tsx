import { motion } from "framer-motion";
import Header from "../components/header/Header";
import AboutFTSection from "./AboutFTSection";

const Home: React.FC = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <Header />
      <main className="w-full"> {/* Removed pt-20 md:pt-24 - no space between header and content */}
        <AboutFTSection />
      </main>
    </motion.div>
  );
};

export default Home;