import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import CompanyDashboard from './CompanyDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardContainer() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#5A5A56' }}>
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#D45A2A' }}>
        Please log in to access your dashboard.
      </div>
    );
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
}
