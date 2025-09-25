/**
 * Register Page Component
 * - Since app uses Google OAuth, registration = login with Google
 * - This page acts as a landing screen for new users
 * - Provides CTA to Login page
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, PenTool, Shield, Users, Sparkles } from 'lucide-react';

// ✅ This component doesn’t perform actual signup
// It’s just a UI wrapper that tells users to log in with Google.

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to login page on button click
  const handleGetStarted = () => {
    navigate('/login');
  };

  // Features for new users
  const features = [
    {
      icon: PenTool,
      title: 'Write & Share',
      description: 'Publish your own stories, tutorials, or opinions in minutes.',
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Connect with readers and writers around the globe.',
    },
    {
      icon: Shield,
      title: 'Secure Login',
      description: 'Your account is protected with Google OAuth.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* ---------- Left: Welcome Message ---------- */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <UserPlus className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your <span className="text-purple-600">BlogApp</span> Account
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sign up in seconds using your Google account. Start writing, sharing, 
            and connecting with the community today!
          </p>

          {/* CTA button → redirects to Login page */}
          <button
            onClick={handleGetStarted}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-md transition-colors"
          >
            Get Started with Google
          </button>

          {/* Already have account */}
          <p className="mt-4 text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* ---------- Right: Features ---------- */}
        <div className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                    <Icon className="h-6 w-6 text-purple-600" />
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

          {/* Bonus highlight */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <h3 className="text-lg font-semibold">Completely Free</h3>
            </div>
            <p className="mt-2 text-purple-100">
              No hidden fees. No credit card required. Just bring your creativity ✍️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
