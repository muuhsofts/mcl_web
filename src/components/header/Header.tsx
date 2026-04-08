import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet, HelmetProvider } from "react-helmet-async";

import mclLogo from '../../assets/logo.png';

// --- Interfaces ---
interface NavItem {
  label: string;
  path: string;
  dropdown?: Array<{ label: string; path: string }>;
}

interface DropdownMenuProps {
  isOpen: boolean;
  items: Array<{ label: string; path: string }>;
  onClose: () => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  onClose: () => void;
}

interface MetaTag {
  title: string;
  description: string;
  keywords?: string;
  structuredData?: object | object[];
  og?: {
    title: string;
    description: string;
    type: string;
    url: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
  };
}

const companyMenuItems: NavItem[] = [
  { label: "Leadership", path: "/company/leadership" },
  { label: "Sustainability", path: "/company/sustainability" },
  { label: "NMG-Group", path: "https://www.nationmedia.com/" },
];

const careersMenuItems: NavItem[] = [
  { label: "Vacancies", path: "https://careers.mcl.co.tz" },
];

const navItems: NavItem[] = [
  { label: "About Us", path: "/" },
  { label: "Company", path: "", dropdown: companyMenuItems },
  { label: "Our Brands", path: "/our-brands" },
  { label: "News", path: "/company/news" },
  { label: "Gallery", path: "/gallery" },
  { label: "Events", path: "/all-events" },
  { label: "Careers", path: "", dropdown: careersMenuItems },
  { label: "Contact", path: "/company/contact-us" },
];

// --- Meta Tags Mapping ---
const metaTags: { [key: string]: MetaTag } = {
  "/": {
    title: "Mwananchi Communications Limited",
    description: "Is a subsidiary of Nation Media Group. Tanzania's Leading Media  Company",
    keywords: "Trusted Journalism, Diverse Platforms, Impactful Stories",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Mwananchi Communications Limited",
        url: "https://www.mcl.co.tz",
        logo: "https://www.mcl.co.tz/assets/logo.png",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+255-754-780-647",
          contactType: "customer service",
          email: "support@mwananchi.co.tz",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        url: "https://www.mcl.co.tz",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.mcl.co.tz/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        url: "https://www.mcl.co.tz",
        name: "Mwananchi Communications Limited",
        hasPart: navItems.map(item => ({
          "@type": "SiteNavigationElement",
          name: item.label,
          url: item.path.startsWith("http") ? item.path : `https://www.mcl.co.tz${item.path}`,
        })),
      },
    ],
    og: {
      title: "Mwananchi Communications Limited",
      description: "Is a subsidiary of Nation Media Group. Tanzania's Leading Media  Company",
      type: "website",
      url: "https://www.mcl.co.tz",
    },
    twitter: {
      card: "summary_large_image",
      title: "Mwananchi Communications Limited",
      description: "Is a subsidiary of Nation Media Group. It is the leading print media company in Tanzania with print as well as online platforms. It was established in May 1999 as a Media Communication Limited and transformed to the advertising & Public Relations agency in year 2001 and was later acquired by Nation Media Group in the year 2002. Through Newspapers, we deliver a literate and informed audience who are opinion leaders, early adopters, and heavy consumers of different brands and service.",
    },
  },
  "/our-brands": {
    title: "Our Brands | Mwananchi Communications Limited",
    description: "Explore MCL's brands, including Mwanaclick, Mwananchi, The Citizen, Mwanaspoti, bringing news, entertainment, and insights to Tanzania and beyond.",
    keywords: "Mwanaclick, Mwananchi, The Citizen, Mwanaspoti, Tanzanian media brands",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Mwananchi Communications Limited",
        url: "https://www.mcl.co.tz",
        logo: "https://www.mcl.co.tz/assets/logo.png",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+255-754-780-647",
          contactType: "customer service",
          email: "support@mwananchi.co.tz",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "Mwanaclick",
        url: "https://mwanaclick.com/",
        publisher: {
          "@type": "Organization",
          name: "Mwananchi Communications Limited",
          url: "https://www.mcl.co.tz"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "Mwananchi",
        url: "https://www.mwananchi.co.tz/",
        publisher: {
          "@type": "Organization",
          name: "Mwananchi Communications Limited",
          url: "https://www.mcl.co.tz"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "The Citizen",
        url: "https://www.thecitizen.co.tz/",
        publisher: {
          "@type": "Organization",
          name: "Mwananchi Communications Limited",
          url: "https://www.mcl.co.tz"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "Mwanaspoti",
        url: "https://www.mwanaspoti.co.tz/",
        publisher: {
          "@type": "Organization",
          name: "Mwananchi Communications Limited",
          url: "https://www.mcl.co.tz"
        }
      },
    ],
    og: {
      title: "Our Brands | Mwananchi Communications Limited",
      description: "Explore MCL's brands, including Mwanaclick, Mwananchi, The Citizen, Mwanaspoti, bringing news, entertainment, and insights to Tanzania and beyond.",
      type: "website",
      url: "https://www.mcl.co.tz/our-brands",
    },
    twitter: {
      card: "summary_large_image",
      title: "Our Brands | Mwananchi Communications Limited",
      description: "Explore MCL's brands, including Mwanaclick, Mwananchi, The Citizen, Mwanaspoti, bringing news, entertainment, and insights to Tanzania and beyond.",
    },
  },
  "/company/news": {
    title: "Latest News & Updates",
    description: "Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti.",
    og: {
      title: "Latest News & Updates from MCL",
      description: "Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti.",
      type: "website",
      url: "https://www.mcl.co.tz/company/news",
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest News & Updates from MCL",
      description: "Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti.",
    },
  },
  "/gallery": {
    title: "Gallery | Mwananchi Communications Limited",
    description: "Explore our collection of images, events, and moments captured across MCL's brands and activities.",
    keywords: "gallery, photos, events, MCL images, Tanzania media gallery",
    og: {
      title: "Gallery | Mwananchi Communications Limited",
      description: "Explore our collection of images, events, and moments captured across MCL's brands and activities.",
      type: "website",
      url: "https://www.mcl.co.tz/gallery",
    },
    twitter: {
      card: "summary_large_image",
      title: "Gallery | Mwananchi Communications Limited",
      description: "Explore our collection of images, events, and moments captured across MCL's brands and activities.",
    },
  },
  "/company/contact-us": {
    title: "Contact Mwananchi Communications Limited",
    description: "Reach out to Mwananchi Communications Limited for inquiries, advertising, or customer support. Our team is ready to assist you.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Mwananchi Communications Limited",
      url: "https://www.mcl.co.tz",
      telephone: "+255-754-780-647",
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Media House, Dar es Salaam",
        addressLocality: "Dar es Salaam",
        addressCountry: "TZ",
      },
    },
  },
  "/careers": {
    title: "Careers at Mwananchi Communications Limited",
    description: "Join MCL's dynamic team and help shape Tanzania's media landscape. Explore career opportunities in journalism, digital media, and administration.",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Careers at MCL",
      description: "Explore career opportunities at Mwananchi Communications Limited in journalism, digital media, and administration.",
      hiringOrganization: {
        "@type": "Organization",
        name: "Mwananchi Communications Limited",
        sameAs: "https://www.mcl.co.tz",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dar es Salaam",
          addressCountry: "TZ",
        },
      },
    },
  },
  "/all-events": {
    title: "Latest News & Updates",
    description: "Stay updated with the latest news, insights, and stories from MCL brands including Mwananchi, The Citizen, and Mwanaspoti.",
  },
  default: {
    title: "Mwananchi Communications Limited",
    description: "Is a subsidiary of Nation Media Group. It is a Tanzania's Leading Media  Company",
  },
};

const navLinkClass = "relative no-underline font-semibold text-base uppercase text-white transition-opacity duration-200 tracking-tight hover:underline hover:underline-offset-8 hover:opacity-100";

// --- Sub-Components ---
const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, items, onClose }) => (
  <motion.div
    className={`absolute left-0 top-full pt-2 w-56 z-50 ${isOpen ? "block" : "hidden"}`}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
    transition={{ duration: 0.3 }}
    role="menu"
    aria-hidden={!isOpen}
  >
    <div className="bg-[#0A51A1] rounded-lg overflow-hidden">
      <div className="py-2 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const isExternal = item.path.startsWith("http");
          const itemClasses = "block relative no-underline px-4 py-2 text-xs font-semibold uppercase text-white hover:opacity-100 opacity-90 hover:underline transition-all duration-200 text-left rounded-md mx-2";
          return isExternal ? (
            <a
              key={item.label}
              href={item.path}
              className={itemClasses}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              role="menuitem"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className={itemClasses}
              onClick={onClose}
              role="menuitem"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  </motion.div>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, navItems, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.nav
        className="absolute top-full left-0 w-full bg-[#0A51A1] lg:hidden p-6 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        role="navigation"
        aria-hidden={!isOpen}
      >
        {navItems.map((item) => (
          <div key={item.label} className="relative py-3 text-center">
            <NavLink
              to={item.path}
              className={({ isActive }) => `${navLinkClass} block ${isActive ? "opacity-100" : "opacity-80"}`}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
            {item.dropdown && (
              <div className="mt-4 space-y-3 bg-white/5 rounded-lg p-3">
                {item.dropdown.map((subItem) => {
                  const isExternal = subItem.path.startsWith("http");
                  const subItemClasses = "block relative no-underline text-sm font-semibold uppercase text-white/80 hover:text-white hover:underline";
                  return isExternal ? (
                    <a
                      key={subItem.label}
                      href={subItem.path}
                      className={subItemClasses}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                    >
                      {subItem.label}
                    </a>
                  ) : (
                    <Link
                      key={subItem.label}
                      to={subItem.path}
                      className={subItemClasses}
                      onClick={onClose}
                    >
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </motion.nav>
    )}
  </AnimatePresence>
);

// --- Main Header Component ---
const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const location = useLocation();

  // Select meta tags based on current route
  const currentMeta = metaTags[location.pathname] || metaTags.default;

  return (
    <HelmetProvider>
      <motion.header
        className="sticky top-0 z-50 w-full bg-[#0A51A1]"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Helmet>
          <title>{currentMeta.title}</title>
          <meta name="description" content={currentMeta.description} />
          {currentMeta.keywords && <meta name="keywords" content={currentMeta.keywords} />}
          {currentMeta.og && (
            <>
              <meta property="og:title" content={currentMeta.og.title} />
              <meta property="og:description" content={currentMeta.og.description} />
              <meta property="og:type" content={currentMeta.og.type} />
              <meta property="og:url" content={currentMeta.og.url} />
            </>
          )}
          {currentMeta.twitter && (
            <>
              <meta name="twitter:card" content={currentMeta.twitter.card} />
              <meta name="twitter:title" content={currentMeta.twitter.title} />
              <meta name="twitter:description" content={currentMeta.twitter.description} />
            </>
          )}
          {Array.isArray(currentMeta.structuredData) 
            ? currentMeta.structuredData.map((data, index) => (
                <script key={index} type="application/ld+json">
                  {JSON.stringify(data)}
                </script>
              ))
            : currentMeta.structuredData && (
                <script type="application/ld+json">
                  {JSON.stringify(currentMeta.structuredData)}
                </script>
              )}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-16 lg:px-15 py-4">
          <div className="flex items-center justify-start gap-x-12">
            <Link to="/" className="flex-shrink-0 lg:px-9">
              <img
                src={mclLogo}
                alt="Mwananchi Communications Limited Logo"
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <nav className="items-center hidden gap-12 lg:flex">
              {navItems.map((item, index) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setOpenDropdownIndex(index)}
                  onMouseLeave={() => item.dropdown && setOpenDropdownIndex(null)}
                >
                  <div className="relative">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `${navLinkClass} text-center ${isActive ? "opacity-100" : "opacity-80"}`}
                      aria-expanded={openDropdownIndex === index}
                    >
                      {item.label}
                    </NavLink>
                    {item.label === "News" && (
                      <motion.div
                        className="absolute -top-1 -right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full"
                        animate={{
                          scale: [1, 1.4, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(239, 68, 68, 0.6)",
                            "0 0 0 5px rgba(239, 68, 68, 0)",
                          ],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </div>
                  {item.dropdown && (
                    <DropdownMenu
                      isOpen={openDropdownIndex === index}
                      items={item.dropdown}
                      onClose={() => setOpenDropdownIndex(null)}
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
            <button
              className="lg:hidden text-white z-50 p-3"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          navItems={navItems}
          onClose={() => setMobileMenuOpen(false)}
        />
      </motion.header>
    </HelmetProvider>
  );
};

export default Header;