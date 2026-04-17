import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface ContactCategory {
  contactus_id: number;
  category: string;
  description: string | null;
  img_file: string | null;
  url_link: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactInfo {
  contact_info_id: number;
  phone_one: string;
  phone_two: string | null;
  contactus_id: number;
  email_address: string;
  webmail_address: string | null;
  location: string;
  contact_us: ContactCategory;
}

// --- LOADER (unchanged) ---
const LandingLoader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  >
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <motion.h2
      className="text-2xl font-bold text-white mt-4"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      Loading Contact Page...
    </motion.h2>
  </motion.div>
);

// --- MODERN HERO SECTION (replaces slideshow) ---
const ModernHero: React.FC = () => (
  <section className="relative bg-gradient-to-br from-[#0A51A1] to-[#003459] text-white py-24 md:py-32 overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-6 text-white/90" />
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Let's Connect</h1>
        <p className="mt-4 text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
          We’re here to answer your questions and help you find what you need.
        </p>
      </motion.div>
    </div>
  </section>
);

// --- ENHANCED CONTACT CARD (new design) ---
const ContactCard: React.FC<{ category: ContactCategory; contactInfos: ContactInfo[] }> = ({ category, contactInfos }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  const isLongDescription = category.description && category.description.length > maxLength;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imageUrl = category.img_file ? `${baseURL}/${category.img_file.replace(/^\//, "")}` : "";

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            src={imageUrl}
            alt={category.category}
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error")}
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-[#003459] mb-2">{category.category}</h3>
        {category.description && (
          <div className="mb-4">
            <p className={`text-gray-600 leading-relaxed ${!isExpanded && isLongDescription ? "line-clamp-3" : ""}`}>
              {category.description}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#ed1c24] font-semibold text-sm hover:text-[#003459] mt-1 transition-colors"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
        {contactInfos.length > 0 ? (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            {contactInfos.map((info) => (
              <div key={info.contact_info_id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-[#ed1c24] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{info.phone_one}{info.phone_two && ` / ${info.phone_two}`}</span>
                </div>
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-[#ed1c24] mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${info.email_address}`} className="text-gray-700 hover:text-[#003459] break-all">
                    {info.email_address}
                  </a>
                </div>
                {info.webmail_address && (
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-[#ed1c24] mt-0.5 flex-shrink-0" />
                    <a href={`mailto:${info.webmail_address}`} className="text-gray-700 hover:text-[#003459] break-all">
                      {info.webmail_address}
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#ed1c24] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{info.location}</span>
                </div>
                {category.url_link && (
                  <div className="flex items-start gap-3">
                    <LinkIcon className="w-5 h-5 text-[#ed1c24] mt-0.5 flex-shrink-0" />
                    <a href={category.url_link} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#003459]">
                      Visit website
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-4">No contact details available.</p>
        )}
      </div>
    </motion.div>
  );
};

// --- CONTACT SECTION (redesigned grid) ---
const ContactSection: React.FC<{ categories: ContactCategory[]; allContactInfos: ContactInfo[] }> = ({
  categories,
  allContactInfos,
}) => {
  if (!categories.length && !allContactInfos.length) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">No Contact Data Available</h3>
        <p className="mt-2 text-gray-600">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-[#003459]"
          >
            Reach Out to Us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-gray-600 max-w-2xl mx-auto"
          >
            Choose the department you’d like to contact – we’ll get back to you as soon as possible.
          </motion.p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {categories.map((category) => (
              <ContactCard
                key={category.contactus_id}
                category={category}
                contactInfos={allContactInfos.filter((info) => info.contactus_id === category.contactus_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-3 text-gray-600">No contact categories found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- MAIN PAGE (no slideshow) ---
const ContactHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [categoriesResponse, infosResponse] = await Promise.all([
          axiosInstance.get<ContactCategory[]>("/api/allContactUs"),
          axiosInstance.get<{ contact_infos: ContactInfo[] }>("/api/contactInfo"),
        ]);

        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
        setContactInfos(infosResponse.data?.contact_infos || []);
      } catch (error: any) {
        console.error("API Fetch Error:", error);
        toast.error(`Failed to load contact data: ${error.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, []);

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AnimatePresence>{isLoading && <LandingLoader />}</AnimatePresence>
      <motion.div
        className="flex-grow flex flex-col"
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
        variants={contentVariants}
      >
        <ModernHero />
        <main className="flex-grow">
          <ContactSection categories={categories} allContactInfos={contactInfos} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default ContactHomePage;