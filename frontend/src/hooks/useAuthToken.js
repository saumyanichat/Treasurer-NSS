import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '@/lib/api';

export function useAuthToken() {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      if (userId) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };
    
    fetchToken();
  }, [getToken, userId]);
}
