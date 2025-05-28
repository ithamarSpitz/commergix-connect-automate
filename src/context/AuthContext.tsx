
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { PlanType, UserRole } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userDetails: {
    role: UserRole;
    planType: PlanType;
    name: string | null;
    avatarUrl: string | null;
  } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  supabaseClient,
}: {
  children: React.ReactNode;
  supabaseClient: SupabaseClient;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<AuthContextType['userDetails']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserDetails(session.user.id);
      } else {
        // No user is logged in, set loading to false to proceed with the app
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserDetails(session.user.id);
        } else {
          setUserDetails(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  const fetchUserDetails = async (userId: string) => {
    try {
      // Try to fetch user details
      const { data, error } = await supabaseClient
        .from('users')
        .select('role, plan_type, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user details:', error);
        
        // Set default values anyway so the app can function
        setUserDetails({
          role: 'merchant' as UserRole,
          planType: 'free' as PlanType,
          name: user?.email?.split('@')[0] || 'User',
          avatarUrl: null,
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        setUserDetails({
          role: data.role as UserRole,
          planType: data.plan_type as PlanType,
          name: data.name,
          avatarUrl: data.avatar_url,
        });
      } else {
        console.warn('No user profile found, using default values');
        // If no profile exists, use default values
        setUserDetails({
          role: 'merchant' as UserRole,
          planType: 'free' as PlanType,
          name: user?.email?.split('@')[0] || 'User',
          avatarUrl: null,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
      // Set default values to allow app to function
      setUserDetails({
        role: 'merchant' as UserRole,
        planType: 'free' as PlanType,
        name: user?.email?.split('@')[0] || 'User',
        avatarUrl: null,
      });
    } finally {
      // Always set loading to false to ensure the app proceeds
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userDetails,
        isLoading,
        signOut,
        isAdmin: userDetails?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
