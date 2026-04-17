import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import {
  AboutSliderData,
  MwananchiAboutData,
  AboutCardData,
  SubscriptionData,
  ValueData,
  LandingLoader,
} from "./components/about/aboutCommon"; // fixed path
import AboutHeroSection from "./components/about/AboutHeroSection";
import AboutMwananchiSection from "./components/about/AboutMwananchiSection";
import VisionMissionSection from "./components/about/VisionMissionSection";
import OurValuesSection from "./components/about/OurValuesSection";
import SubscriptionCountersSection from "./components/about/SubscriptionCountersSection";
import AboutContentSection from "./components/about/AboutContentSection";
import ValueModal from "./components/about/ValueModal";

const AboutFTSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [mwananchiContent, setMwananchiContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      const fetchDataPromise = Promise.allSettled([
        axiosInstance.get<AboutSliderData[]>("/api/slider-imgs"),
        axiosInstance.get<{ data: SubscriptionData[] }>("/api/allsubscriptions"),
        axiosInstance.get<{ records: MwananchiAboutData[] }>("/api/about-mwananchi/all"),
        axiosInstance.get<{ values: ValueData[] }>("/api/values/all"),
        axiosInstance.get("/api/latestbrand"),
        axiosInstance.get("/api/latestnew"),
        axiosInstance.get("/api/latestEvent"),
      ]);

      const minimumLoadTimePromise = new Promise((resolve) => setTimeout(resolve, 1200));
      const [results] = await Promise.all([fetchDataPromise, minimumLoadTimePromise]);

      if (results[0].status === "fulfilled" && Array.isArray(results[0].value.data))
        setSliderData(results[0].value.data);
      else if (results[0].status === "rejected") {
        console.error("Failed to fetch hero content:", results[0].reason);
        toast.error("Failed to fetch hero content.");
      }

      if (
        results[1].status === "fulfilled" &&
        Array.isArray(results[1].value.data.data)
      )
        setSubscriptions(results[1].value.data.data);
      else if (results[1].status === "rejected") {
        console.error("Failed to load audience data:", results[1].reason);
        toast.error("Failed to load audience data.");
      }

      if (
        results[2].status === "fulfilled" &&
        results[2].value.data?.records?.length > 0
      )
        setMwananchiContent(results[2].value.data.records[0]);
      else if (results[2].status === "rejected") {
        console.error("Failed to fetch company information:", results[2].reason);
        toast.error("Failed to fetch company information.");
      }

      if (
        results[3].status === "fulfilled" &&
        Array.isArray(results[3].value.data.values)
      )
        setValues(results[3].value.data.values);
      else if (results[3].status === "rejected") {
        console.error("Failed to fetch company values:", results[3].reason);
        toast.error("Failed to fetch company values.");
      }

      const createCard = (
        data: any,
        type: AboutCardData["type"],
        idKey: string,
        title: string,
        descKey: string,
        imgKey: string,
        link: string,
        dateKey: string
      ): AboutCardData | null => {
        if (!data || !data[idKey]) return null;
        return {
          id: data[idKey],
          type,
          title: data.title || title,
          description: data[descKey] || "",
          imageUrl: data[imgKey] || null,
          linkUrl: link,
          createdAt: data[dateKey] || new Date().toISOString(),
        };
      };

      const potentialCards: (AboutCardData | null)[] = [];
      if (results[4].status === "fulfilled")
        potentialCards.push(
          createCard(
            results[4].value.data,
            "Brand",
            "brand_id",
            results[4].value.data?.category || "Our Brand",
            "description",
            "brand_img",
            "/our-brands",
            "created_at"
          )
        );
      if (results[5].status === "fulfilled")
        potentialCards.push(
          createCard(
            results[5].value.data?.news,
            "News",
            "news_id",
            "Latest News",
            "description",
            "news_img",
            "/company/news",
            "created_at"
          )
        );
      if (results[6].status === "fulfilled")
        potentialCards.push(
          createCard(
            results[6].value.data?.event,
            "Events",
            "event_id",
            results[6].value.data?.event?.event_category || "Latest Event",
            "description",
            "img_file",
            "/all-events",
            "created_at"
          )
        );

      setCards(potentialCards.filter((card): card is AboutCardData => card !== null));
      setIsLoading(false);
    };
    loadPageData();
  }, []);

  return (
    <div className="min-h-screen text-gray-800 font-inter flex flex-col bg-gray-50">
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
      <AnimatePresence>
        {selectedValue && (
          <ValueModal value={selectedValue} onClose={() => setSelectedValue(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>
      {!isLoading && (
        <>
          <header>
            <AboutHeroSection data={sliderData} />
          </header>
          <main className="flex-grow">
            {/* Added id for About Mwananchi section */}
            <section id="about-mwananchi">
              <AboutMwananchiSection content={mwananchiContent} />
            </section>
            {/* Added id for Vision & Mission section */}
            <section id="vision-mission">
              <VisionMissionSection />
            </section>
            {/* Added id for Our Values section */}
            <section id="our-values">
              <OurValuesSection values={values} onCardClick={setSelectedValue} />
            </section>
            <SubscriptionCountersSection subscriptions={subscriptions} />
            <AboutContentSection cards={cards} />
          </main>
          <footer>
            <Footer />
          </footer>
        </>
      )}
    </div>
  );
};

export default AboutFTSection;