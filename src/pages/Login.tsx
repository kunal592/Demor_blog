/**
 * Login Page Component
 * - Integrates Google Identity Services (OAuth 2.0)
 * - Handles Google login → sends credential (JWT) to backend `/auth/google`
 * - Stores backend-issued token in localStorage (via AuthContext)
 * - Redirects to dashboard after login
 * - Includes marketing features section for better UX
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Chrome, Shield, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// ------------------------------------------------
// Global typings for Google Identity SDK
// ------------------------------------------------
declare global {
  interface Window {
    google: any;
    googleInit: boolean;
  }
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // our AuthContext login() → sends credential to backend
  const navigate = useNavigate();

  // ------------------------------------------------
  // Load Google Identity script when component mounts
  // ------------------------------------------------
  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const initializeGoogleAuth = () => {
    // Avoid re-initializing script if already loaded
    if (window.googleInit) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;

    script.onload = () => {
      // Ensure Google Client ID is configured
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.error('❌ Google Client ID missing in .env');
        return;
      }

      // Initialize Google button
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse, // callback after successful login
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render button inside our container
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

      window.googleInit = true; // mark as initialized
    };

    document.head.appendChild(script);
  };

  // ------------------------------------------------
  // Handle credential returned from Google login
  // ------------------------------------------------
  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);

      // Call AuthContext login() → which hits backend `/auth/google`
      await login(response.credential);

      toast.success('✅ Login successful!');
      navigate('/dashboard'); // redirect to dashboard
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // Feature highlights shown in right panel
  // ------------------------------------------------
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Summaries',
      description: 'Instant AI-generated summaries for your blogs using Gemini AI',
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Like, bookmark, and share blogs with the community',
    },
    {
      icon: Shield,
      title: 'Secure & Fast',
      description: 'Built with modern security practices and optimized for performance',
    },
  ];

  // ------------------------------------------------
  // Render UI
  // ------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* ---------- Left: Login Card ---------- */}
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
                  Sign in to continue reading and writing amazing stories 🚀
                </p>
              </div>

              {/* Google Sign-In Button */}
              <div className="space-y-6">
                <div>
                  <div 
                    id="google-signin-button"
                    className={`w-full ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  />
                </div>

                {/* Loader while login request is pending */}
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

                {/* Info box about Google OAuth */}
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

              {/* Footer legal text */}
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

          {/* ---------- Right: Features ---------- */}
          <div className="space-y-8 lg:pl-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Join Our Growing
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Community</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with writers and readers from around the world. Share your stories, 
                discover perspectives, and engage with meaningful content 🌍
              </p>
            </div>

            {/* Map through features */}
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
                Join thousands of writers sharing their stories with the world 🌟
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
