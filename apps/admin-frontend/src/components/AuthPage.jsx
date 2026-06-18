import React, { useState } from 'react';

export default function AuthPage({ onSignIn }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const triggerFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const switchMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setFeedback(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid Gmail address (ending in @gmail.com).');
      return;
    }

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
      triggerFeedback('Creating secure account credentials...', 'success');
      setTimeout(() => {
        setIsLoading(false);
        onSignIn(trimmedEmail);
      }, 2000);
    } else {
      triggerFeedback('Verifying credentials...', 'success');
      setTimeout(() => {
        setIsLoading(false);
        onSignIn(trimmedEmail);
      }, 1500);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    triggerFeedback('Opening Google Sign-In Window...', 'success');
    setTimeout(() => {
      setIsLoading(false);
      onSignIn('google.user@gmail.com');
    }, 1800);
  };

  // Lock/Key icon for header
  const LockIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  // Eye icons
  const EyeOpen = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  );

  const EyeClosed = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  );

  return (
    <div className="bg-gradient-to-tr from-slate-50 via-gray-100 to-blue-50 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 antialiased">
      <div className="w-full max-w-md animate-slideUp">
        {/* Feedback Banner */}
        {feedback && (
          <div className={`mb-4 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm animate-slideDown border ${
            feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {feedback.text}
          </div>
        )}

        <div className="bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-4">
              <LockIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSignUp ? 'Set up your administrator credentials' : 'Access your E-Office dashboard'}
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl shadow-sm border border-gray-200 hover:shadow transition-all duration-200 mb-5 active:scale-[0.98] outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400 font-medium">OR</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email" id="email" required
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none"
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} id="password" required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none"
                />
                <button type="button" onClick={togglePasswordVisibility} disabled={isLoading} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 placeholder-gray-400 text-gray-900 text-sm outline-none"
                  />
                  <button type="button" onClick={toggleConfirmPasswordVisibility} disabled={isLoading} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                    {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
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

            {/* Remember Me (Sign In only) */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-all cursor-pointer" />
                  <span className="text-xs text-gray-600 select-none">Remember for 30 days</span>
                </label>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

          {/* Footer Switch */}
          <p className="text-center text-xs text-gray-500 mt-8">
            {isSignUp ? (
              <>Already have an account?{' '}<button onClick={() => switchMode(false)} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none">Sign in</button></>
            ) : (
              <>Don't have an account?{' '}<button onClick={() => switchMode(true)} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none">Sign up for free</button></>
            )}
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
