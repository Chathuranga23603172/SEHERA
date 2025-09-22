import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiGithub,
  FiHeart
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Wardrobe Management', href: '/menswear' },
      { name: 'Style Combos', href: '/style-combo' },
      { name: 'Budget Tracking', href: '/budget' },
      { name: 'Reports & Analytics', href: '/reports' },
      { name: 'Mobile App', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'User Guide', href: '/guide' },
      { name: 'API Documentation', href: '/api-docs' },
      { name: 'System Status', href: '/status' },
      { name: 'Bug Report', href: '/bug-report' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR Compliance', href: '/gdpr' },
      { name: 'Security', href: '/security' }
    ]
  };

  const socialLinks = [
    { icon: FiFacebook, href: 'https://facebook.com/fashionhub', label: 'Facebook' },
    { icon: FiTwitter, href: 'https://twitter.com/fashionhub', label: 'Twitter' },
    { icon: FiInstagram, href: 'https://instagram.com/fashionhub', label: 'Instagram' },
    { icon: FiLinkedin, href: 'https://linkedin.com/company/fashionhub', label: 'LinkedIn' },
    { icon: FiGithub, href: 'https://github.com/fashionhub', label: 'GitHub' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h3 className="text-2xl font-bold text-white">
                Stay updated with Fashion Trends
              </h3>
              <p className="mt-2 text-gray-300 max-w-3xl">
                Get the latest fashion tips, budget management strategies, and style inspiration 
                delivered to your inbox weekly.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <form className="sm:flex">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:max-w-xs"
                  placeholder="Enter your email"
                />
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border border-transparent rounded-md py-3 px-6 flex items-center justify-center text-base font-medium text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="mt-3 text-sm text-gray-400">
                We care about your data. Read our{' '}
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold font-playfair">Fashion Hub</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Your ultimate fashion companion for wardrobe management, style creation, 
              and budget tracking. Discover your unique style while staying within budget.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiMail size={14} />
                <span>support@fashionhub.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiPhone size={14} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiMapPin size={14} />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>&copy; {currentYear} Fashion Hub. All rights reserved.</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Made with</span>
              <FiHeart className="hidden sm:inline text-red-500 w-4 h-4" />
              <span className="hidden sm:inline">by ITP_125 Team</span>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition duration-200"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
            <p>
              Fashion Hub is a comprehensive wardrobe management and style visualization platform.
              All trademarks and brand names are the property of their respective owners.
            </p>
            <p className="mt-2">
              This application uses secure payment processing through Stripe and follows industry-standard 
              security practices to protect your personal and financial information.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;