
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Set a timeout to navigate to login if authentication takes too long
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      if (isLoading) {
        // Force navigation to login if still loading after timeout
        navigate("/login");
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">
        {timeoutReached 
          ? "Taking longer than expected. Redirecting to login..." 
          : "Loading your application..."}
      </p>
    </div>
  );
};

export default Index;
