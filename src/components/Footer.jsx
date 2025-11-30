import React from "react";
import {
  FaGithub,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand / Short about */}
        <div>
          <h3 className="text-white font-bold text-xl mb-3">Team Manager</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            A compact, modern platform to manage teams, tasks and ship product faster.
            Built with clarity in mind.
          </p>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <FaMapMarkerAlt className="text-sky-400" />
            <div>
              <p className="text-gray-300 font-medium">Meerut Institute of Technology</p>
              <p className="text-xs text-gray-400">Meerut, Uttar Pradesh, India</p>
            </div>
          </div>

          <div className="mt-4">
            <a href="mailto:aditya@zephrinix.in" className="inline-flex items-center gap-2 text-sm hover:text-sky-400 transition-colors">
              <FaEnvelope /> <span>aditya@zephrinix.in</span>
            </a>
          </div>
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

        {/* Contact / Socials + Mini Map */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Connect with us</h3>

          <div className="flex gap-4 mb-4">
            <a href="https://github.com/adityadevraj699?tab=repositories" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-sky-400 transition-colors text-xl">
              <FaGithub />
            </a>
            <a href="https://www.instagram.com/sudo_dev.404" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-sky-400 transition-colors text-xl">
              <FaInstagram />
            </a>
            <a href="https://www.linkedin.com/in/adityadevraj699/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-sky-400 transition-colors text-xl">
              <FaLinkedinIn />
            </a>
            <a href="https://twitter.com/adityadevraj699" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-sky-400 transition-colors text-xl">
              <FaTwitter />
            </a>
          </div>

          <p className="text-gray-400 text-sm mb-3">Quick view</p>
          <div className="w-full rounded overflow-hidden border border-gray-800">
            <iframe
              title="location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3492.0093582493178!2d77.63679241116795!3d28.927772370509942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c614f846e713f%3A0xdf29c5d5329144f0!2sMeerut%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1764530635728!5m2!1sen!2sin"
              width="100%"
              height="140"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-10 text-center border-t border-gray-800 pt-6">
        <p className="text-sm text-gray-500">© 2025 <span className="text-sky-400 font-semibold">Team Manager</span>. All Rights Reserved.</p>
        <p className="text-xs text-gray-500 mt-1">
          Aditya Kumar and its team • <a href="https://aditya-portfolio-org.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">Portfolio</a>
        </p>
      </div>
    </footer>
  );
}
