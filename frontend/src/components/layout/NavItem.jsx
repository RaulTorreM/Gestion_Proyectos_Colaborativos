// src/components/layout/NavItem.jsx
import { Link } from 'react-router-dom'
import { Tooltip } from '../common/Tooltip'

export default function NavItem({ icon, text, to, collapsed }) {
  return (
    <>
      {collapsed ? (
        <Tooltip content={text} position="right">
          <Link
            to={to}
            className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-900 text-gray-300 hover:text-white transition-colors"
          >
            {icon}
          </Link>
        </Tooltip>
      ) : (
        <Link
          to={to}
          className="flex items-center p-3 rounded-lg hover:bg-gray-900 text-gray-300 hover:text-white transition-colors"
        >
          <span className="mr-3">{icon}</span>
          <span>{text}</span>
        </Link>
      )}
    </>
  )
}