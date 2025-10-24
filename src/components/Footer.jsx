import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Team Manager</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Manage your projects and teams efficiently with a professional,
            easy-to-use platform trusted by hundreds of teams worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <a href="/" className="hover:text-sky-400 transition-colors">Home</a>
            </li>
            <li>
              <a href="/features" className="hover:text-sky-400 transition-colors">Features</a>
            </li>
            <li>
              <a href="/pricing" className="hover:text-sky-400 transition-colors">Pricing</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-sky-400 transition-colors">Contact</a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <a href="/docs" className="hover:text-sky-400 transition-colors">Documentation</a>
            </li>
            <li>
              <a href="/blog" className="hover:text-sky-400 transition-colors">Blog</a>
            </li>
            <li>
              <a href="/faq" className="hover:text-sky-400 transition-colors">FAQ</a>
            </li>
            <li>
              <a href="/support" className="hover:text-sky-400 transition-colors">Support</a>
            </li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Contact & Socials</h3>
          <p className="text-gray-400 text-sm mb-4">
            123 Team Manager St.<br />
            Your City, Country<br />
            Email: support@teammanager.com
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors"><FaFacebookF /></a>
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors"><FaTwitter /></a>
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors"><FaLinkedinIn /></a>
            <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-10 text-center border-t border-gray-800 pt-6">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} <span className="text-sky-400 font-semibold">Team Manager</span>. All Rights Reserved.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Built with ❤️ using React + Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
