import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

// Updated About Us submenu – first item triggers scroll to section instead of navigation
const aboutUsMenuItems: NavItem[] = [
  { label: "About Us", path: "#about-mwananchi-section" }, // Will trigger scroll
  { label: "Vision & Mission", path: "/vision-mission" },
  { label: "Our Values", path: "/our-values" },
];

const companyMenuItems: NavItem[] = [
  { label: "Leadership", path: "/company/leadership" },
  { label: "Sustainability", path: "/company/sustainability" },
  { label: "NMG-Group", path: "https://www.nationmedia.com/" },
];

const careersMenuItems: NavItem[] = [
  { label: "Vacancies", path: "https://careers.mcl.co.tz" },
];

// Main nav items - About Us top-level will use custom scroll behavior
const navItems: NavItem[] = [
  { label: "About Us", path: "#about-mwananchi-section", dropdown: aboutUsMenuItems }, // Path is a fragment, will be handled by custom click
  { label: "Company", path: "", dropdown: companyMenuItems },
  { label: "Our Brands", path: "/our-brands" },
  { label: "News and Updates", path: "/company/news" },
  { label: "Events", path: "/all-events" },
  { label: "Careers", path: "", dropdown: careersMenuItems },
  { label: "Contact", path: "/company/contact-us" },
];

const navLinkClass = "relative no-underline font-semibold text-base uppercase text-white transition-opacity duration-200 tracking-tight hover:underline hover:underline-offset-8 hover:opacity-100";

// Helper function to scroll to the AboutMwananchiSection
const scrollToAboutSection = () => {
  const element = document.getElementById('about-mwananchi-section');
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Fallback: if the element doesn't exist yet (e.g., page not fully loaded), wait a bit and try again
    setTimeout(() => {
      const retryElement = document.getElementById('about-mwananchi-section');
      if (retryElement) {
        retryElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.warn("AboutMwananchiSection not found on the page. Make sure an element with id 'about-mwananchi-section' exists.");
      }
    }, 100);
  }
};

// Helper for optional hash scroll (for other sections if needed)
const handleSmoothScroll = (hash: string) => {
  if (hash) {
    const element = document.getElementById(hash.substring(1));
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }
};

// --- Sub-Components ---
const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, items, onClose }) => (
  <motion.div
    className={`absolute left-0 top-full pt-2 w-56 z-50 ${isOpen ? "block" : "hidden"}`}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-[#0A51A1] rounded-lg overflow-hidden">
      <div className="py-2 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const isExternal = item.path.startsWith("http");
          const isHashLink = item.path.includes("#");
          // Special handling for "About Us" submenu item linking to the section
          const isAboutSubmenu = item.label === "About Us" && item.path === "#about-mwananchi-section";
          const itemClasses = "block relative no-underline px-4 py-2 text-xs font-semibold uppercase text-white hover:opacity-100 opacity-90 hover:underline transition-all duration-200 text-left rounded-md mx-2";

          if (isAboutSubmenu) {
            // Render as button that scrolls to AboutMwananchiSection
            return (
              <button
                key={item.label}
                className={itemClasses}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAboutSection();
                  onClose();
                }}
              >
                {item.label}
              </button>
            );
          } else if (isExternal) {
            return (
              <a key={item.label} href={item.path} className={itemClasses} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                {item.label}
              </a>
            );
          } else if (isHashLink) {
            return (
              <a
                key={item.label}
                href={item.path}
                className={itemClasses}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  const [basePath, hash] = item.path.split("#");
                  if (window.location.pathname !== basePath && basePath !== "") {
                    window.location.href = basePath;
                  } else {
                    handleSmoothScroll(`#${hash}`);
                  }
                }}
              >
                {item.label}
              </a>
            );
          } else {
            return (
              <Link key={item.label} to={item.path} className={itemClasses} onClick={onClose}>
                {item.label}
              </Link>
            );
          }
        })}
      </div>
    </div>
  </motion.div>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, navItems, onClose }) => {
  // Helper to render a single menu item (with potential dropdown)
  const renderMobileNavItem = (item: NavItem) => {
    const isAboutMain = item.label === "About Us";
    const mainItemClasses = `${navLinkClass} block ${isAboutMain ? "cursor-pointer" : ""}`;

    return (
      <div key={item.label} className="relative py-3 text-center">
        {isAboutMain ? (
          <button
            className={mainItemClasses}
            onClick={(e) => {
              e.preventDefault();
              scrollToAboutSection();
              onClose();
            }}
          >
            {item.label}
          </button>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) => `${navLinkClass} block ${isActive ? "opacity-100" : "opacity-80"}`}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        )}
        {item.dropdown && (
          <div className="mt-4 space-y-3 bg-white/5 rounded-lg p-3">
            {item.dropdown.map((subItem) => {
              const isExternal = subItem.path.startsWith("http");
              const isHashLink = subItem.path.includes("#");
              const isAboutSubmenu = subItem.label === "About Us" && subItem.path === "#about-mwananchi-section";
              const subItemClasses = "block relative text-sm font-semibold uppercase text-white/80 hover:text-white hover:underline";

              if (isAboutSubmenu) {
                return (
                  <button
                    key={subItem.label}
                    className={subItemClasses}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToAboutSection();
                      onClose();
                    }}
                  >
                    {subItem.label}
                  </button>
                );
              } else if (isExternal) {
                return (
                  <a key={subItem.label} href={subItem.path} className={subItemClasses} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                    {subItem.label}
                  </a>
                );
              } else if (isHashLink) {
                return (
                  <a
                    key={subItem.label}
                    href={subItem.path}
                    className={subItemClasses}
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      const [basePath, hash] = subItem.path.split("#");
                      if (window.location.pathname !== basePath && basePath !== "") {
                        window.location.href = basePath;
                      } else {
                        handleSmoothScroll(`#${hash}`);
                      }
                    }}
                  >
                    {subItem.label}
                  </a>
                );
              } else {
                return (
                  <Link key={subItem.label} to={subItem.path} className={subItemClasses} onClick={onClose}>
                    {subItem.label}
                  </Link>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          className="absolute top-full left-0 w-full bg-[#0A51A1] lg:hidden p-6 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {navItems.map(renderMobileNavItem)}
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

// --- Main Header Component ---
const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Handle hash changes for other sections if needed
  useEffect(() => {
    if (location.hash) {
      handleSmoothScroll(location.hash);
    }
  }, [location]);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-[#0A51A1]"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-16 lg:px-15 py-4">
        <div className="flex items-center justify-start gap-x-12">
          <Link to="/" className="flex-shrink-0 lg:px-9">
            <img src={mclLogo} alt="MCL Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>

          <nav className="items-center hidden gap-12 lg:flex">
            {navItems.map((item) => {
              const isAboutMain = item.label === "About Us";
              // Handle custom scroll for "About Us" top-level link
              const handleAboutClick = (e: React.MouseEvent) => {
                if (isAboutMain) {
                  e.preventDefault();
                  scrollToAboutSection();
                  setOpenDropdown(null);
                }
              };

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                  onMouseLeave={() => item.dropdown && setOpenDropdown(null)}
                >
                  <div className="relative">
                    {isAboutMain ? (
                      <button
                        className={`${navLinkClass} text-center ${location.pathname === "/" ? "opacity-100" : "opacity-80"}`}
                        onClick={handleAboutClick}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `${navLinkClass} text-center ${isActive ? "opacity-100" : "opacity-80"}`}
                      >
                        {item.label}
                      </NavLink>
                    )}

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
                      isOpen={openDropdown === item.label}
                      items={item.dropdown}
                      onClose={() => setOpenDropdown(null)}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
          <button
            className="lg:hidden text-white z-50"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
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
  );
};

export default Header;