
import { Outlet } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Link, Package, User } from "lucide-react";

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentPath = location.pathname.split("/").pop() || "";
  
  const tabs = [
    {
      value: "profile",
      label: "Profile",
      icon: User,
    },
    {
      value: "connections",
      label: "Connections",
      icon: Link,
    },
    {
      value: "shipping",
      label: "Shipping",
      icon: Package,
    },
    {
      value: "billing",
      label: "Billing",
      icon: CreditCard,
    },
  ];
  
  const handleTabChange = (value: string) => {
    navigate(`/settings/${value}`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Card>
        <Tabs value={currentPath} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="p-6">
            <Outlet />
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;
