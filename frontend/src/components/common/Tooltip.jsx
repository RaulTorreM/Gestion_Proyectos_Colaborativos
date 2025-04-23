// src/components/common/Tooltip.jsx
import { useState } from 'react'

export function Tooltip({ children, content, position = 'right' }) {
  const [visible, setVisible] = useState(false)

  const positionClasses = {
    right: 'left-full ml-2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2',
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className="relative">
      <div 
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className={`absolute ${positionClasses[position]} px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg z-50 whitespace-nowrap`}>
          {content}
        </div>
      )}
    </div>
  )
}