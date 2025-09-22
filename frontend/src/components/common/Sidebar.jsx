import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiShirt,
  FiUser,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiBarChart3,
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiChevronRight,
  FiShoppingBag,
  FiTrendingUp,
  FiCalendar,
  FiCreditCard,
  FiPieChart
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    wardrobe: true,
    analytics: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      description: 'Overview and quick stats'
    }
  ];

  const wardrobeItems = [
    {
      name: 'Menswear',
      href: '/menswear',
      icon: FiShirt,
      description: 'Manage men\'s clothing',
      badge: 'NEW'
    },
    {
      name: 'Womenswear',
      href: '/womenswear',
      icon: FiUser,
      description: 'Manage women\'s clothing'
    },
    {
      name: 'Kidswear',
      href: '/kidswear',
      icon: FiUsers,
      description: 'Manage children\'s clothing'
    },
    {
      name: 'Style Combos',
      href: '/style-combo',
      icon: FiLayers,
      description: 'Create and manage outfits'
    }
  ];

  const analyticsItems = [
    {
      name: 'Budget Overview',
      href: '/budget',
      icon: FiDollarSign,
      description: 'Track spending and budgets'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FiBarChart3,
      description: 'Analytics and insights'
    },
    {
      name: 'Trends',
      href: '/trends',
      icon: FiTrendingUp,
      description: 'Fashion trend analysis'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: FiCalendar,
      description: 'Outfit planning calendar'
    }
  ];

  const bottomNavItems = [
    {
      name: 'Payments',
      href: '/payments',
      icon: FiCreditCard,
      description: 'Payment methods and history'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: FiSettings,
      description: 'App preferences'
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: FiHelpCircle,
      description: 'Get help and tutorials'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavItem = ({ item, isActive, onClick }) => (
    <Link
      to={item.href}
      onClick={onClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <item.icon
        className={`mr-3 flex-shrink-0 h-5 w-5 ${
          isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
        }`}
      />
      <div className="flex-1 min-w-0">
        <span className="truncate">{item.name}</span>
        {item.badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            {item.badge}
          </span>
        )}
      </div>
    </Link>
  );

  const SectionHeader = ({ title, isExpanded, onToggle, icon: Icon }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
    >
      <div className="flex items-center">
        <Icon className="mr-2 h-4 w-4" />
        <span>{title}</span>
      </div>
      {isExpanded ? (
        <FiChevronDown className="h-4 w-4" />
      ) : (
        <FiChevronRight className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white font-playfair">
                Fashion Hub
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={onClose}
                />
              ))}
            </div>

            {/* Wardrobe Section */}
            <div>
              <SectionHeader
                title="Wardrobe"
                icon={FiShoppingBag}
                isExpanded={expandedSections.wardrobe}
                onToggle={() => toggleSection('wardrobe')}
              />
              {expandedSections.wardrobe && (
                <div className="mt-2 space-y-1">
                  {wardrobeItems.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={isActive(item.href)}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <div>
              <SectionHeader
                title="Analytics"
                icon={FiPieChart}
                isExpanded={expandedSections.analytics}
                onToggle={() => toggleSection('analytics')}
              />
              {expandedSections.analytics && (
                <div className="mt-2 space-y-1">
                  {analyticsItems.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={isActive(item.href)}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-1">
            {bottomNavItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
                onClick={onClose}
              />
            ))}
          </div>

          {/* User Stats Card */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Quick Stats
              </h4>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium text-green-600">$1,240</span>
                </div>
                <div className="flex justify-between">
                  <span>Saved:</span>
                  <span className="font-medium text-blue-600">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;