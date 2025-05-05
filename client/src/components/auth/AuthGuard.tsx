
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/auth/login');
    }
  }, [isAuthenticated, loading, setLocation]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : null;
}
