
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useShopifyOAuth } from "@/hooks/useShopifyOAuth";
import { ExternalLink, Power, RefreshCw, Store, Trash2 } from "lucide-react";

const ConnectionsPage = () => {
  const [shopDomain, setShopDomain] = useState("");
  const [mirakleApiKey, setMirakleApiKey] = useState("");
  const { initiateOAuth, isLoading } = useShopifyOAuth();
  
  // Mock data for demonstration
  const connectedStores = [
    {
      id: "store1",
      name: "My Awesome Shop",
      platform: "shopify",
      domain: "awesome-shop.myshopify.com",
      status: "active",
      lastSync: "2023-04-10T14:32:00Z",
    },
  ];
  
  const syncLogs = [
    {
      id: "log1",
      type: "orders",
      details: "Successfully synced 5 new orders from Shopify",
      status: "success",
      timestamp: "2023-04-10T14:32:00Z",
    },
    {
      id: "log2",
      type: "products",
      details: "Updated inventory for 12 products",
      status: "success",
      timestamp: "2023-04-10T13:15:00Z",
    },
    {
      id: "log3",
      type: "products",
      details: "Failed to sync product images",
      status: "error",
      timestamp: "2023-04-09T16:45:00Z",
    },
  ];
  
  const handleShopifyConnect = () => {
    initiateOAuth(shopDomain);
  };
  
  const handleMirakleConnect = () => {
    console.log("Connecting to Mirakl with API key:", mirakleApiKey);
    // Implement Mirakl connection logic
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getSyncStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "partial":
        return <Badge variant="warning">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Store Connections</h3>
        <p className="text-sm text-muted-foreground">
          Connect your e-commerce platforms to sync products and orders.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shopify</CardTitle>
                <CardDescription>Connect your Shopify store</CardDescription>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Shopify store domain to connect
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleShopifyConnect} 
              disabled={!shopDomain || isLoading}
              className="w-full"
            >
              {isLoading ? "Connecting..." : "Connect Shopify"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mirakl</CardTitle>
                <CardDescription>Connect your Mirakl marketplace</CardDescription>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Mirakl API key"
                value={mirakleApiKey}
                onChange={(e) => setMirakleApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find your API key in your Mirakl seller dashboard
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleMirakleConnect} 
              disabled={!mirakleApiKey}
              className="w-full"
            >
              Connect Mirakl
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Connected Stores</h3>
        <div className="space-y-4">
          {connectedStores.length > 0 ? (
            connectedStores.map((store) => (
              <Card key={store.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-medium">{store.name}</h4>
                        {getStatusBadge(store.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {store.platform === "shopify" ? "Shopify" : "Mirakl"} • {store.domain}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(store.lastSync).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Store
                      </Button>
                      <Button variant="outline" size="sm" className="text-amber-500 border-amber-500">
                        <Power className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                You haven't connected any stores yet. Connect a store to get started.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Recent Sync Activity</h3>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{log.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.type} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    {getSyncStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionsPage;
