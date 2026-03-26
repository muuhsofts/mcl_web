import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../axios";
import { AboutSliderData, SubscriptionData, MwananchiAboutData, ValueData, AboutCardData } from "./types";
import { cleanText, stripHtml } from "./helpers";

export const useAboutData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [aboutContent, setAboutContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const [hero, subs, about, vals, brand, news, event] = await Promise.all([
          axiosInstance.get("/api/slider-imgs", { signal: controller.signal }),
          axiosInstance.get("/api/allsubscriptions", { signal: controller.signal }),
          axiosInstance.get("/api/about-mwananchi/all", { signal: controller.signal }),
          axiosInstance.get("/api/values/all", { signal: controller.signal }),
          axiosInstance.get("/api/latestbrand", { signal: controller.signal }),
          axiosInstance.get("/api/latestnew", { signal: controller.signal }),
          axiosInstance.get("/api/latestEvent", { signal: controller.signal }),
        ]);

        if (!mounted) return;

        setSliderData(hero.data || []);
        setSubscriptions(subs.data?.data || []);
        setAboutContent(about.data?.records?.[0] || null);
        setValues(vals.data?.values || []);

        const cardItems: AboutCardData[] = [];
        
        if (brand.data?.brand_id) {
          cardItems.push({
            id: brand.data.brand_id,
            type: "Brand",
            title: brand.data.category || "Brand",
            description: cleanText(brand.data.description || ""),
            imageUrl: brand.data.brand_img || null,
            linkUrl: "/our-brands",
          });
        }

        if (news.data?.news?.news_id) {
          cardItems.push({
            id: news.data.news.news_id,
            type: "News",
            title: news.data.news.category || "News",
            description: stripHtml(news.data.news.description || ""),
            imageUrl: news.data.news.news_img || null,
            linkUrl: "/company/news",
          });
        }

        if (event.data?.event?.event_id) {
          cardItems.push({
            id: event.data.event.event_id,
            type: "Events",
            title: event.data.event.event_category || "Event",
            description: cleanText(event.data.event.description || ""),
            imageUrl: event.data.event.img_file || null,
            linkUrl: "/all-events",
          });
        }

        setCards(cardItems);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        if (err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error("Error loading data:", err);
        setError("Unable to load content. Please check your connection.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleValueClick = useCallback((value: ValueData) => {
    setSelectedValue(value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedValue(null);
  }, []);

  return {
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
  };
};