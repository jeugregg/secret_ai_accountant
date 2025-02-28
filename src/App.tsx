import React from 'react'
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'
import CompanyScreen from './CompanyScreen'
import AuditorScreen from './AuditorScreen'
import logo from './assets/Secret-Ai-Acc_logo.svg'

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <nav className="bg-gray-800 text-white py-0">
          <ul className="flex justify-around items-center">
            <li>
              <img src={logo} alt="Logo" className="h-16 w-16 mr-0" />
            </li>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'hover:text-gray-300 underline' : 'hover:text-gray-300'
                }
              >
                Company Screen
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/auditor"
                className={({ isActive }) =>
                  isActive ? 'hover:text-gray-300 underline' : 'hover:text-gray-300'
                }
              >
                Auditor Screen
              </NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<CompanyScreen />} />
          <Route path="/auditor" element={<AuditorScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
