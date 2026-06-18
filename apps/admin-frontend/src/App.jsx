import React, { useState } from 'react';
import AuthPage from './components/AuthPage.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState('');

  const handleSignIn = (email) => {
    setIsSignedIn(true);
    setAuthenticatedUser(email);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setAuthenticatedUser('');
  };

  if (isSignedIn) {
    return (
      <AdminDashboard
        authenticatedUser={authenticatedUser}
        onSignOut={handleSignOut}
      />
    );
  }

  return <AuthPage onSignIn={handleSignIn} />;
}
