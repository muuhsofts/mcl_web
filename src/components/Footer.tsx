import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A51A1] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

          <div>
            <h3 className="text-xl font-bold mb-4">Our Brands</h3>
            <ul className="text-sm space-y-2">
              {/* External links - use <a> tag */}
              <li>
                <a 
                  href="https://mwanaclick.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  MwanaClick
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mwananchi.co.tz/mw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Mwananchi newspaper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mwanaspoti.co.tz/ms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Mwanaspoti newspaper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.thecitizen.co.tz/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  The Citizen newspaper
                </a>
              </li>
              {/* Internal links - use <Link> */}
              
              <li>
                <Link to="https://epaper.nation.africa/tz" className="hover:underline">
                  Nation ePaper
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.youtube.com/@Mwananchidigital" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Mwananchi Digital
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Group Brands</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a 
                  href="https://nation.africa/kenya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Nation Africa
                </a>
              </li>
              <li>
                <a 
                  href="https://www.businessdailyafrica.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Business Daily Africa
                </a>
              </li>
              <li>
                <a 
                  href="https://epaper.nationmedia.com/kenya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  EPapers
                </a>
              </li>
              
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Follow us</h4>
              <div className="flex gap-4 text-lg">
                <a 
                  href="https://www.facebook.com/mwananchipapers" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaFacebookF />
                </a>
                <a 
                  href="https://twitter.com/mwananchi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaTwitter />
                </a>
                <a 
                  href="https://www.instagram.com/mwananchipapers" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaInstagram />
                </a>
                <a 
                  href="https://www.linkedin.com/company/mwananchi-communications-ltd" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2">
              {/* Internal link - use <Link> */}
              <li>
                <Link to="/sign-in" className="hover:underline">
                  Sign In
                </Link>
              </li>
            </ul>
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