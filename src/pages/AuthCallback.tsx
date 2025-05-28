
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process auth callback from hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.has('access_token')) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          // If successful, redirect to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // If no auth parameters in URL, go to login
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication. Please try again.");
        // Still redirect to login after a short delay
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {error ? (
        <div className="text-center p-4 bg-red-100 rounded-md">
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
