import React from 'react';
import { Outlet } from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';

const Layout = ({ darkMode, toggleTheme }) => {
  return (
    <Dashboard darkMode={darkMode} toggleTheme={toggleTheme}>
      <Outlet />
    </Dashboard>
  );
};

export default Layout;