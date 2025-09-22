import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTag, FiCalendar, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const EventTagger = ({ outfit, onTagsUpdate, onClose }) => {
  const [selectedTags, setSelectedTags] = useState(outfit?.eventTags || []);
  const [customTag, setCustomTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Predefined event categories
  const predefinedTags = [
    // Professional Events
    'Work Meeting', 'Job Interview', 'Business Lunch', 'Conference', 'Presentation',
    'Networking Event', 'Office Party', 'Client Meeting', 'Board Meeting',
    
    // Social Events
    'Wedding', 'Birthday Party', 'Anniversary', 'Graduation', 'Baby Shower',
    'Dinner Party', 'Cocktail Party', 'Housewarming', 'Holiday Party',
    
    // Casual Events
    'Date Night', 'Movie Night', 'Shopping', 'Brunch', 'Coffee Meeting',
    'Casual Dinner', 'Park Visit', 'Beach Day', 'Picnic',
    
    // Formal Events
    'Gala', 'Award Ceremony', 'Theater', 'Opera', 'Charity Event',
    'Formal Dinner', 'Black Tie Event', 'Red Carpet', 'Gallery Opening',
    
    // Seasonal Events
    'Summer Vacation', 'Winter Holiday', 'Spring Wedding', 'Fall Festival',
    'Christmas Party', 'New Year Eve', 'Halloween', 'Valentine Day',
    
    // Activity-based
    'Gym', 'Sports Event', 'Concert', 'Festival', 'Travel', 'Weekend Getaway',
    'Outdoor Activity', 'Sports Practice', 'Marathon', 'Yoga Class',
    
    // Special Occasions
    'First Date', 'Anniversary Dinner', 'Family Reunion', 'School Event',
    'Religious Ceremony', 'Cultural Event', 'Art Exhibition', 'Book Launch'
  ];

  const filteredTags = predefinedTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
      setCustomTag('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const saveTags = async () => {
    setIsLoading(true);
    try {
      await onTagsUpdate(selectedTags);
      toast.success('Event tags updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update event tags');
    } finally {
      setIsLoading(false);
    }
  };

  const getTagColor = (tag) => {
    // Color coding based on event type
    const professionalTags = ['Work Meeting', 'Job Interview', 'Business Lunch', 'Conference', 'Presentation', 'Networking Event', 'Client Meeting', 'Board Meeting'];
    const socialTags = ['Wedding', 'Birthday Party', 'Anniversary', 'Graduation', 'Baby Shower', 'Dinner Party', 'Cocktail Party'];
    const formalTags = ['Gala', 'Award Ceremony', 'Theater', 'Opera', 'Charity Event', 'Formal Dinner', 'Black Tie Event'];
    const casualTags = ['Date Night', 'Movie Night', 'Shopping', 'Brunch', 'Coffee Meeting', 'Casual Dinner'];
    
    if (professionalTags.includes(tag)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (socialTags.includes(tag)) return 'bg-green-100 text-green-800 border-green-200';
    if (formalTags.includes(tag)) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (casualTags.includes(tag)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTagsByCategory = () => {
    const categories = {
      'Professional': ['Work Meeting', 'Job Interview', 'Business Lunch', 'Conference', 'Presentation', 'Networking Event', 'Office Party', 'Client Meeting', 'Board Meeting'],
      'Social': ['Wedding', 'Birthday Party', 'Anniversary', 'Graduation', 'Baby Shower', 'Dinner Party', 'Cocktail Party', 'Housewarming', 'Holiday Party'],
      'Formal': ['Gala', 'Award Ceremony', 'Theater', 'Opera', 'Charity Event', 'Formal Dinner', 'Black Tie Event', 'Red Carpet', 'Gallery Opening'],
      'Casual': ['Date Night', 'Movie Night', 'Shopping', 'Brunch', 'Coffee Meeting', 'Casual Dinner', 'Park Visit', 'Beach Day', 'Picnic'],
      'Seasonal': ['Summer Vacation', 'Winter Holiday', 'Spring Wedding', 'Fall Festival', 'Christmas Party', 'New Year Eve', 'Halloween', 'Valentine Day'],
      'Activities': ['Gym', 'Sports Event', 'Concert', 'Festival', 'Travel', 'Weekend Getaway', 'Outdoor Activity', 'Sports Practice', 'Marathon', 'Yoga Class']
    };
    
    return categories;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiTag className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Event Tagger</h2>
              <p className="text-sm text-gray-600">
                Tag "{outfit?.name}" for specific events and occasions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Currently Selected Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Selected Tags ({selectedTags.length})</h3>
            <div className="min-h-[60px] p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTagColor(tag)}`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-red-200 rounded-full p-1 transition"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <FiCalendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No events tagged yet. Select from categories below or add custom tags.</p>
                </div>
              )}
            </div>
          </div>

          {/* Search and Custom Tag Input */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for events..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add Custom Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Event
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter custom event..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Search Results ({filteredTags.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                {filteredTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => addTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border hover:shadow-md transition ${getTagColor(tag)}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No matching events found</p>
                )}
              </div>
            </div>
          )}

          {/* Event Categories */}
          {!searchTerm && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800">Event Categories</h3>
              {Object.entries(getTagsByCategory()).map(([category, tags]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      category === 'Professional' ? 'bg-blue-500' :
                      category === 'Social' ? 'bg-green-500' :
                      category === 'Formal' ? 'bg-purple-500' :
                      category === 'Casual' ? 'bg-yellow-500' :
                      category === 'Seasonal' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></span>
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .filter(tag => !selectedTags.includes(tag))
                      .map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => addTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border hover:shadow-md transition ${getTagColor(tag)}`}
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveTags}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Saving...' : 'Save Tags'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTagger;