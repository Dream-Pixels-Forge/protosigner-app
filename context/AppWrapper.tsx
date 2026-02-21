import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Onboarding } from '@/features/layout/Onboarding';

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    if (!isLoading && user) {
      const completed = localStorage.getItem('onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    } else if (!isLoading && !user) {
      // Not logged in, show onboarding for demo
      const completed = localStorage.getItem('onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [user, isLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading ProtoSigner...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show main app
  return <>{children}</>;
}
