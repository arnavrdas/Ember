// src/components/layout/Navbar.jsx
import './Navbar.css'
import { useApp } from '../../context/AppContext'

const NAV_ITEMS = [
  { id: 'discover', icon: '🔥', label: 'Discover'  },
  { id: 'matches',  icon: '💘', label: 'Matches'   },
  { id: 'messages', icon: '💬', label: 'Messages'  },
  { id: 'profile',  icon: '👤', label: 'Profile'   },
]

export default function Navbar() {
  const { activeSection, setActiveSection } = useApp()

  return (
    <nav>
      <div className="nav-logo">Ember</div>
      <div className="nav-actions">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`icon-btn ${activeSection === item.id ? 'active-nav' : ''}`}
            title={item.label}
            onClick={() => setActiveSection(item.id)}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </nav>
  )
}
