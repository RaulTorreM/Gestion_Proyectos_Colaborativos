// src/components/common/DropdownMenu.jsx
import { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-black-900 border border-gray-700 hover:bg-gray-800 focus:outline-none"
        aria-expanded={isOpen}
      >
        <svg 
          className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-black border border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  item.action();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white focus:outline-none"
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;