import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  NewspaperIcon,
  CalendarIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  UsersIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import axiosInstance from "../axios";
import Footer from "../components/Footer";
import { useEffect, useState, useRef, memo } from "react";
import { Helmet } from "react-helmet";

/* ────────────────────── CONSTANTS ────────────────────── */
const PRIMARY_COLOR = "#0069B4";
const SECONDARY_COLOR = "#FF3520";
const API_BASE_URL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

/* ────────────────────── TYPES ────────────────────── */
interface AboutSliderData {
  about_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
}

interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
}

interface AboutCardData {
  id: number;
  type: "Brand" | "News" | "Events";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
}

interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: number;
  logo_img_file: string;
}

interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
}

/* ────────────────────── UTILITIES ────────────────────── */
const stripHtml = (html: string): string => {
  const txt = html.replace(/<[^>]+>/g, "");
  const el = document.createElement("textarea");
  el.innerHTML = txt;
  return el.value;
};

const cleanForSEO = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

const buildImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

/* ────────────────────── ANIMATION VARIANTS ────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

/* ────────────────────── LOADER ────────────────────── */
const LandingLoader = memo(() => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backgroundColor: PRIMARY_COLOR }}
  >
    <div className="text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full mx-auto"
      />
      <p className="text-sm font-medium text-white mt-3">Loading...</p>
    </div>
  </motion.div>
));

LandingLoader.displayName = 'LandingLoader';

/* ────────────────────── HERO SECTION ────────────────────── */
const HeroSection = memo(({ data }: { data: AboutSliderData[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.length]);

  if (!data.length) return null;

  const slide = data[currentSlide];
  const imageUrl = buildImageUrl(slide.home_img) || "";

  return (
    <section className="relative h-[60vh] min-h-[450px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img 
            src={imageUrl} 
            alt={slide.heading || "Hero image"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0069B4]/90 to-[#FF3520]/70" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <SparklesIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white/90">Welcome</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
              {slide.heading || "Shaping Tanzania's Media Landscape"}
            </h1>
            
            {slide.description && (
              <p className="text-base text-white/80 mb-6 max-w-lg line-clamp-2">
                {cleanForSEO(slide.description)}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 bg-[#FF3520] text-white rounded-full font-medium text-sm hover:shadow-lg transition-all">
                Discover Our Journey
              </button>
              
              <div className="flex gap-2">
                {data.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="h-1.5 rounded-full transition-all cursor-pointer"
                    style={{ 
                      width: idx === currentSlide ? 28 : 8,
                      backgroundColor: idx === currentSlide ? '#FF3520' : 'rgba(255,255,255,0.3)'
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <ChevronDownIcon className="w-4 h-4 text-white/60 animate-bounce" />
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

/* ────────────────────── ABOUT SECTION ────────────────────── */
const AboutSection = memo(({ content }: { content: MwananchiAboutData | null }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!content) return null;

  const paragraphs = content.description
    .split(/\n\s*\n/)
    .map(cleanForSEO)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <section className="relative bg-white overflow-hidden py-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-px bg-[#0069B4]" />
              <span className="text-xs font-semibold tracking-wider text-[#0069B4] uppercase">
                Who We Are
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{content.category}</h2>
            
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-base">{p}</p>
              ))}
            </div>
          </motion.div>

          {content.video_link && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
                <iframe
                  ref={iframeRef}
                  src={`${content.video_link}?autoplay=1&mute=1&controls=0`}
                  title={content.category}
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

/* ────────────────────── VISION MISSION ────────────────────── */
const VisionMissionSection = memo(() => {
  const items = [
    {
      icon: EyeIcon,
      title: "Our Vision",
      description: "To be the leading digital multimedia company in Tanzania, transforming how people consume and interact with media.",
      color: PRIMARY_COLOR,
    },
    {
      icon: RocketLaunchIcon,
      title: "Our Mission",
      description: "To enrich lives and empower positive change through superior media content and innovative digital solutions.",
      color: SECONDARY_COLOR,
    }
  ];

  return (
    <section className="relative bg-gray-50 overflow-hidden py-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Vision & Mission</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

VisionMissionSection.displayName = 'VisionMissionSection';

/* ────────────────────── VALUES SECTION ────────────────────── */
const ValuesSection = memo(({ values, onCardClick }: { values: ValueData[]; onCardClick: (v: ValueData) => void }) => {
  const icons = [ShieldCheckIcon, HeartIcon, LightBulbIcon, UsersIcon];
  const displayValues = values.slice(0, 4);

  if (!displayValues.length) return null;

  return (
    <section className="relative bg-white overflow-hidden py-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Values</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayValues.map((value, idx) => {
            const Icon = icons[idx % icons.length];
            
            return (
              <motion.button
                key={value.value_id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => onCardClick(value)}
                className="text-left group"
              >
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-all">
                  <div 
                    className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}15, ${SECONDARY_COLOR}15)` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{value.category}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {value.description?.substring(0, 50)}...
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
});

ValuesSection.displayName = 'ValuesSection';

/* ────────────────────── REACH SECTION ────────────────────── */
const ReachSection = memo(({ subscriptions }: { subscriptions: SubscriptionData[] }) => {
  const displaySubs = subscriptions.slice(0, 5);

  if (!displaySubs.length) return null;

  return (
    <section className="relative bg-gray-50 overflow-hidden py-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Reach</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displaySubs.map((sub, index) => (
            <motion.div
              key={sub.subscription_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg text-center shadow-md"
            >
              <div className="w-14 h-14 mx-auto mb-2">
                <img
                  src={buildImageUrl(sub.logo_img_file) || ""}
                  alt={sub.category}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-1">{sub.category}</h3>
              <div className="text-xl font-bold" style={{ color: PRIMARY_COLOR }}>
                <CountUp end={sub.total_viewers} duration={2} separator="," />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

ReachSection.displayName = 'ReachSection';

/* ────────────────────── IMAGE MODAL ────────────────────── */
const ImageModal = memo(({ imageUrl, title, onClose }: { imageUrl: string; title: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="relative max-w-5xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose} 
        className="absolute -top-10 right-0 text-white/70 hover:text-white"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-contain max-h-[80vh] rounded-lg"
      />
    </motion.div>
  </motion.div>
));

ImageModal.displayName = 'ImageModal';

/* ────────────────────── DISCOVER CARDS ────────────────────── */
const DiscoverCards = memo(({ cards }: { cards: AboutCardData[] }) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  
  const getIcon = (type: string) => {
    switch(type) {
      case "Brand": return BuildingOfficeIcon;
      case "News": return NewspaperIcon;
      case "Events": return CalendarIcon;
      default: return BuildingOfficeIcon;
    }
  };

  const displayCards = cards.slice(0, 3);

  if (!displayCards.length) return null;

  return (
    <section className="relative bg-white overflow-hidden py-16">
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Discover More</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {displayCards.map((card, index) => {
            const Icon = getIcon(card.type);
            const imageUrl = buildImageUrl(card.imageUrl) || "";
            
            return (
              <motion.div
                key={`${card.type}-${card.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage({ url: imageUrl, title: card.title })}
                    loading="lazy"
                  />
                  
                  <div className="absolute bottom-2 left-2">
                    <div className="px-2 py-1 bg-white/95 backdrop-blur-sm rounded text-xs font-semibold flex items-center gap-1">
                      <Icon className="w-3 h-3" style={{ color: card.type === "Brand" ? PRIMARY_COLOR : SECONDARY_COLOR }} />
                      <span style={{ color: card.type === "Brand" ? PRIMARY_COLOR : SECONDARY_COLOR }}>
                        {card.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
                  <Link 
                    to={card.linkUrl} 
                    className="inline-flex items-center gap-1 text-sm font-semibold"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    Learn More 
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {cards.length > 3 && (
          <div className="text-center mt-12">
            <Link 
              to="/discover-more" 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm border-2 transition-all hover:shadow-md"
              style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
            >
              View All Stories
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

DiscoverCards.displayName = 'DiscoverCards';

/* ────────────────────── VALUE MODAL ────────────────────── */
const ValueModal = memo(({ value, onClose }: { value: ValueData; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: -10 }}
      className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="text-center">
        <div 
          className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center p-3"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_COLOR}15, ${SECONDARY_COLOR}15)` }}
        >
          <img
            src={buildImageUrl(value.img_file) || ""}
            alt={value.category}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{value.category}</h3>
        <p className="text-sm text-gray-600">{value.description}</p>
      </div>
    </motion.div>
  </motion.div>
));

ValueModal.displayName = 'ValueModal';

/* ────────────────────── MAIN PAGE ────────────────────── */
const AboutFTSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [aboutContent, setAboutContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [selectedValue, setSelectedValue] = useState<ValueData | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [hero, subs, about, vals, brand, news, event] = await Promise.allSettled([
          axiosInstance.get("/api/slider-imgs"),
          axiosInstance.get("/api/allsubscriptions"),
          axiosInstance.get("/api/about-mwananchi/all"),
          axiosInstance.get("/api/values/all"),
          axiosInstance.get("/api/latestbrand"),
          axiosInstance.get("/api/latestnew"),
          axiosInstance.get("/api/latestEvent"),
        ]);

        if (!mounted) return;

        if (hero.status === "fulfilled") {
          setSliderData(hero.value.data || []);
        }

        if (subs.status === "fulfilled") {
          setSubscriptions(subs.value.data?.data || []);
        }

        if (about.status === "fulfilled" && about.value.data?.records?.[0]) {
          setAboutContent(about.value.data.records[0]);
        }

        if (vals.status === "fulfilled") {
          setValues(vals.value.data?.values || []);
        }

        const cardItems: AboutCardData[] = [];
        
        if (brand.status === "fulfilled" && brand.value.data?.brand_id) {
          cardItems.push({
            id: brand.value.data.brand_id,
            type: "Brand",
            title: brand.value.data.category || "Brand",
            description: cleanForSEO(brand.value.data.description || ""),
            imageUrl: brand.value.data.brand_img || null,
            linkUrl: "/our-brands",
          });
        }

        if (news.status === "fulfilled" && news.value.data?.news?.news_id) {
          cardItems.push({
            id: news.value.data.news.news_id,
            type: "News",
            title: news.value.data.news.category || "News",
            description: stripHtml(news.value.data.news.description || ""),
            imageUrl: news.value.data.news.news_img || null,
            linkUrl: "/company/news",
          });
        }

        if (event.status === "fulfilled" && event.value.data?.event?.event_id) {
          cardItems.push({
            id: event.value.data.event.event_id,
            type: "Events",
            title: event.value.data.event.event_category || "Event",
            description: cleanForSEO(event.value.data.event.description || ""),
            imageUrl: event.value.data.event.img_file || null,
            linkUrl: "/all-events",
          });
        }

        setCards(cardItems);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) {
          setTimeout(() => setIsLoading(false), 500);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer position="top-right" theme="colored" />
      
      <AnimatePresence mode="wait">
        {isLoading && <LandingLoader />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedValue && (
          <ValueModal value={selectedValue} onClose={() => setSelectedValue(null)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Helmet>
            <title>About Us | Leading Media Company in Tanzania</title>
            <meta 
              name="description" 
              content={aboutContent ? cleanForSEO(aboutContent.description).slice(0, 155) : "Leading digital multimedia company in Tanzania"} 
            />
          </Helmet>

          <HeroSection data={sliderData} />
          
          <main>
            <AboutSection content={aboutContent} />
            <VisionMissionSection />
            <ValuesSection values={values} onCardClick={setSelectedValue} />
            <ReachSection subscriptions={subscriptions} />
            <DiscoverCards cards={cards} />
          </main>
          
          <Footer />
        </>
      )}
    </div>
  );
};

export default AboutFTSection;