import React, { useState } from 'react';

export default function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [feedback, setFeedback] = useState(null); // { text: string, type: 'success' | 'error' }
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState('');

  // Toggle Password Visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Helper to trigger alert banner
  const triggerFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Reset all input errors and form values when switching views
  const switchMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setFeedback(null);
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // Validate Gmail Address
    if (!gmailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid Gmail address (ending in @gmail.com).');
      return;
    }

    // Sign Up specific validation
    if (isSignUp) {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    if (isSignUp) {
      // Simulate Account Creation & Auto Sign-In
      triggerFeedback('Creating secure account credentials...', 'success');
      setTimeout(() => {
        setIsLoading(false);
        setIsSignedIn(true);
        setAuthenticatedUser(trimmedEmail);
        triggerFeedback('Account created! Automatically logging you in...', 'success');
      }, 2000);
    } else {
      // Simulate Login
      triggerFeedback('Verifying credentials...', 'success');
      setTimeout(() => {
        setIsLoading(false);
        setIsSignedIn(true);
        setAuthenticatedUser(trimmedEmail);
        triggerFeedback('Login successful! Welcome back.', 'success');
      }, 1500);
    }
  };

  // Simulate Google OAuth
  const handleGoogleLogin = () => {
    setIsLoading(true);
    triggerFeedback('Opening Google Sign-In Window...', 'success');
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSignedIn(true);
      setAuthenticatedUser('google.user@gmail.com');
      triggerFeedback('Authenticated via Google successfully!', 'success');
    }, 1800);
  };

  const handleSignOut = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSignedIn(false);
      setAuthenticatedUser('');
      switchMode(false); // Return to default sign-in screen
    }, 1000);
  };

  // Signed In Dashboard view
  if (isSignedIn) {
    return (
      <div className="bg-gradient-to-tr from-slate-50 via-gray-100 to-blue-50 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 antialiased">
        <div className="w-full max-w-md">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-center transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Access Granted</h2>
            <p className="text-sm text-gray-500 mt-1">You are logged in securely</p>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Signed in as</span>
              <span className="block font-medium text-gray-800 text-sm mt-1 break-all">{authenticatedUser}</span>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => triggerFeedback('Navigating to dashboard modules...', 'success')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 outline-none"
              >
                Go to Workspace
              </button>
              
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 outline-none"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-slate-50 via-gray-100 to-blue-50 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 antialiased">
      <div className="w-full max-w-md">
        
        {/* Logo / Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3 transform hover:scale-105 transition-transform duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp ? 'Get started with just a Google mail address' : 'Please sign in to access your dashboard'}
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all duration-300">
          
          {/* Google SSO Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.37 -0.03,-0.72 -0.1,-1H21.35z" fill="#4285F4" />
                <path d="M12,20.5c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.92,0.6 -2.1,1 -3.66,1 -2.82,0 -5.2,-1.9 -6.05,-4.46H1.54v2.7C3.02,17.9 7.23,20.5 12,20.5z" fill="#34A853" />
                <path d="M5.95,12.24c-0.22,-0.66 -0.35,-1.36 -0.35,-2.09s0.13,-1.43 0.35,-2.09V5.36H1.54C0.56,7.3 0,9.48 0,11.75s0.56,4.45 1.54,6.39l4.41,-3.5H5.95z" fill="#FBBC05" />
                <path d="M12,4.8c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.1 14.43,1 12,1C7.23,1 3.02,3.6 1.54,6.56l4.41,3.5c0.85,-2.56 3.23,-4.46 6.05,-4.46z" fill="#EA4335" />
              </g>
            </svg>
            <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          {/* Separator Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-gray-300/60 w-full"></div>
            <span className="absolute bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              or use your email
            </span>
          </div>

          {/* Feedback Alert Module */}
          {feedback && (
            <div 
              className={`mb-5 p-3 rounded-xl text-sm border flex items-start gap-2.5 animate-fadeIn transition-all duration-200 ${
                feedback.type === 'error' 
                  ? 'bg-red-50 text-red-800 border-red-200' 
                  : 'bg-green-50 text-green-800 border-green-200'
              }`}
            >
              <span className="mt-0.5">
                {feedback.type === 'error' ? (
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="font-medium text-xs leading-relaxed">{feedback.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Gmail Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  required
                  placeholder="username@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none ${
                    emailError ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                {!isSignUp && (
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none"
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only shown during Sign Up) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {passwordError}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me Checkbox (Only shown during Sign In) */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-all cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 select-none">Remember for 30 days</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign in'
              )}
            </button>
          </form>

          {/* Footer Navigation Switch Link */}
          <p className="text-center text-xs text-gray-500 mt-8">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => switchMode(false)}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => switchMode(true)}
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
                >
                  Sign up for free
                </button>
              </>
            )}
          </p>
        </div>

        {/* Legal Guidelines */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}