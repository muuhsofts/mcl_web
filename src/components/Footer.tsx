import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A51A1] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Mwananchi Communications LTD</h3>
            <p className="text-sm leading-relaxed">
              Plot no: 34/35 Mandela Road, Tabata Relini,<br />
              Mwananchi, Dar es Salaam, Tanzania
            </p>
            <p className="text-sm mt-4">
              <span className="font-semibold">Phone:</span> +255 754 780 647<br />
              <span className="font-semibold">Email:</span> support@mwananchi.co.tz<br />
              <span className="font-semibold">Advertising:</span> abosco@tz.nationmedia.com
            </p>
          </div>

          {/* Our Brands */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Brands</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a 
                  href="https://mwanaclick.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  MwanaClick
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mwananchi.co.tz/mw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  Mwananchi newspaper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mwanaspoti.co.tz/ms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  Mwanaspoti newspaper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.thecitizen.co.tz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  The Citizen newspaper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.youtube.com/@Mwananchidigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  Mwananchi Digital
                </a>
              </li>
            </ul>
          </div>

          {/* Our Group Brands & Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Group Brands</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a 
                  href="https://nation.africa/kenya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  Nation Africa
                </a>
              </li>
              <li>
                <a 
                  href="https://www.businessdailyafrica.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  Business Daily Africa
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="flex flex-wrap gap-4 text-lg">
                {/* Facebook Mwananchi */}
                <a 
                  href="https://www.facebook.com/mwanaanchi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Facebook Mwananchi"
                >
                  <FaFacebookF />
                </a>
                {/* X (Twitter) Mwananchi */}
                <a 
                  href="https://x.com/Mwananchi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                  aria-label="X Mwananchi"
                >
                  <FaXTwitter />
                </a>
                {/* Instagram Mwananchi */}
                <a 
                  href="https://www.instagram.com/mwananchi_official/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Instagram Mwananchi"
                >
                  <FaInstagram />
                </a>
                {/* LinkedIn Mwananchi */}
                <a 
                  href="https://tz.linkedin.com/company/mwananchi-communications-ltd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn Mwananchi"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links & Additional Social */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link to="/sign-in" className="hover:underline transition-all">
                  Sign In
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Other Social Accounts</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-xs text-white/70 mb-1">The Citizen</p>
                  <div className="flex gap-4">
                    <a 
                      href="https://tz.linkedin.com/company/the-citizen-newspaper" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-xs"
                    >
                      LinkedIn
                    </a>
                    <a 
                      href="https://www.instagram.com/thecitizentz/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-xs"
                    >
                      Instagram
                    </a>
                    <a 
                      href="https://x.com/TheCitizen" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-xs"
                    >
                      X
                    </a>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-xs text-white/70 mb-1">Mwanaspoti</p>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.instagram.com/mwanaspoti_tz/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-xs"
                    >
                      Instagram
                    </a>
                    <a 
                      href="https://x.com/Mwanaspoti" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-xs"
                    >
                      X
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Mwananchi Communications LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;