import { memo, useState, useEffect } from "react";
import { AboutSliderData, SubscriptionData } from "./types";
import SliderComp from "./SliderComp";
import DigitalReachComp from "./DigitalReachComp";
import axiosInstance from "../../axios";

interface HeroSectionProps {
  data?: AboutSliderData[];
  subscriptions?: SubscriptionData[];
}

const HeroSection = memo(({ data = [], subscriptions = [] }: HeroSectionProps) => {
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch slider images data
  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await axiosInstance.get('/api/slider-imgs');
        // The API returns an array directly
        const fetchedData = response.data;
        setSliderData(Array.isArray(fetchedData) ? fetchedData : []);
      } catch (err) {
        console.error('Error fetching slider images:', err);
        setError('Failed to load slider images');
        setSliderData([]);
      }
    };

    if (data && data.length > 0) {
      // Use props if provided
      setSliderData(data);
    } else {
      // Otherwise fetch from API
      fetchSliderData();
    }
  }, [data]);

  // Fetch subscriptions data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axiosInstance.get('/api/allsubscriptions');
        // API returns { data: [...] }
        const fetchedData = response.data?.data || [];
        setSubscriptionData(fetchedData);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Failed to load subscriptions');
        setSubscriptionData([]);
      } finally {
        setLoading(false);
      }
    };

    if (subscriptions && subscriptions.length > 0) {
      // Use props if provided
      setSubscriptionData(subscriptions);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      fetchSubscriptions();
    }
  }, [subscriptions]);

  // Show loading state
  if (loading && !subscriptions.length) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0069B4] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !sliderData.length && !subscriptionData.length) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#0069B4] text-white rounded-lg hover:bg-[#005a9e]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render slider if no data
  if (!sliderData.length) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Slider Component */}
      <SliderComp data={sliderData} isMobile={isMobile} />
      
      {/* Digital Reach Component - Only render if there's subscription data */}
      {subscriptionData.length > 0 && (
        <DigitalReachComp subscriptions={subscriptionData} isMobile={isMobile} />
      )}
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;