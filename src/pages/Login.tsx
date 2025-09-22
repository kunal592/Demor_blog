/**
 * Login Page Component
 * - Integrates Google OAuth via Google Identity Services
 * - Handles user login with backend
 * - Displays features + nice UI/UX
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Chrome, Shield, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../App';

// ------------------------------------------------
// Google Identity Services typing (for TS support)
// ------------------------------------------------
declare global {
  interface Window {
    google: any;
    googleInit: boolean;
  }
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // use login function from AuthContext
  const navigate = useNavigate();

  // --------------------------------------
  // Load Google OAuth script on mount
  // --------------------------------------
  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  // Inject Google Identity Services script and initialize
  const initializeGoogleAuth = () => {
    // Prevent multiple initializations
    if (window.googleInit) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;

    script.onload = () => {
      // Ensure Client ID is set in env
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) { // Correctly using VITE_ prefix
        console.error('Google Client ID not configured');
        return;
      }

      // Initialize Google sign-in
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Correctly using VITE_ prefix
        callback: handleGoogleResponse, // called when user logs in
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the Google button into our container
      const buttonElement = document.getElementById('google-signin-button');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });
      }

      window.googleInit = true; // mark initialized
    };

    document.head.appendChild(script);
  };

  // --------------------------------------
  // Handle response from Google sign-in
  // --------------------------------------
  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);

      // Send Google credential to backend → get JWT + user info
      await login(response.credential);

      toast.success('Login successful!');
      navigate('/dashboard'); // redirect after login
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Features shown on right-hand side (marketing info)
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Summaries',
      description: 'Get instant AI-generated summaries for your blog posts using Gemini AI',
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Like, bookmark, and share your favorite blog posts with the community',
    },
    {
      icon: Shield,
      title: 'Secure & Fast',
      description: 'Built with modern security practices and optimized for performance',
    },
  ];

  // --------------------------------------
  // Component Render
  // --------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* ---------- Left Side: Login Card ---------- */}
          <div className="max-w-md w-full mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <LogIn className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to your account to continue writing and reading amazing stories
                </p>
              </div>

              {/* Google Sign-In Button */}
              <div className="space-y-6">
                <div>
                  <div 
                    id="google-signin-button"
                    className={`w-full ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  ></div>
                </div>

                {/* Loading spinner when authenticating */}
                {loading && (
                  <div className="text-center">
                    <div className="inline-block animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm text-gray-600 mt-2">Signing you in...</p>
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Quick & Secure</span>
                  </div>
                </div>

                {/* Info about Google login */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Chrome className="h-5 w-5 text-blue-600" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Sign in with Google</p>
                      <p className="text-gray-500">Secure OAuth authentication</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>

          {/* ---------- Right Side: Features ---------- */}
          <div className="space-y-8 lg:pl-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Join Our Growing
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Community</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with writers and readers from around the world. Share your stories, 
                discover new perspectives, and engage with content that matters to you.
              </p>
            </div>

            {/* Map through features list */}
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
              <p className="text-blue-100 mb-4">
                Join over 1,000 writers sharing their stories and connecting with readers worldwide.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Free to join</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>No credit card required</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
