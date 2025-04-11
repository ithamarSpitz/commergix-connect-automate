
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { Store, StoreStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StoreTable } from "@/components/stores/StoreTable";
import { AddStoreForm } from "@/components/stores/AddStoreForm";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchStores();
  }, [user]);
  
  const fetchStores = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("stores")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching stores:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stores",
          variant: "destructive",
        });
      } else {
        // Convert database records to Store type
        const typedStores: Store[] = data?.map(store => ({
          id: store.id,
          user_id: store.user_id,
          platform: store.platform,
          store_name: store.store_name,
          domain: store.domain,
          api_key: store.api_key,
          access_token: store.access_token,
          status: store.status as StoreStatus,
          created_at: store.created_at
        })) || [];
        
        setStores(typedStores);
      }
    } catch (error) {
      console.error("Error in fetchStores:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStore = async (storeName: string, platform: string) => {
    if (!user || !storeName || !platform) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingStore(true);
    try {
      const { data, error } = await supabaseClient
        .from("stores")
        .insert([{
          user_id: user.id,
          store_name: storeName,
          platform: platform,
          status: "pending",
        }])
        .select("*")
        .single();
      
      if (error) {
        console.error("Error adding store:", error);
        toast({
          title: "Error",
          description: "Failed to add store",
          variant: "destructive",
        });
      } else if (data) {
        // Convert the returned data to Store type
        const newStore: Store = {
          id: data.id,
          user_id: data.user_id,
          platform: data.platform,
          store_name: data.store_name,
          domain: data.domain,
          api_key: data.api_key,
          access_token: data.access_token,
          status: data.status as StoreStatus,
          created_at: data.created_at
        };
        
        setStores([...stores, newStore]);
        toast({
          title: "Store Added",
          description: "Store added successfully",
        });
      }
    } catch (error) {
      console.error("Error in handleAddStore:", error);
    } finally {
      setIsAddingStore(false);
    }
  };
  
  const handleDeleteStore = async (storeId: string) => {
    try {
      const { error } = await supabaseClient
        .from("stores")
        .delete()
        .eq("id", storeId);
      
      if (error) {
        console.error("Error deleting store:", error);
        toast({
          title: "Error",
          description: "Failed to delete store",
          variant: "destructive",
        });
      } else {
        setStores(stores.filter(store => store.id !== storeId));
        toast({
          title: "Store Deleted",
          description: "Store deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast({
        title: "Error",
        description: "Failed to delete store",
        variant: "destructive",
      });
    }
  };
  
  const handleSyncStore = async (storeId: string) => {
    try {
      // TODO: Implement sync logic
      toast({
        title: "Sync Initiated",
        description: "Sync initiated for store",
      });
    } catch (error) {
      console.error("Error syncing store:", error);
      toast({
        title: "Error",
        description: "Failed to sync store",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Connections</h2>
        <p className="text-muted-foreground">
          Manage your store connections.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Stores</CardTitle>
          <CardDescription>
            Manage your connected stores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreTable 
            stores={stores}
            isLoading={isLoading}
            onSyncStore={handleSyncStore}
            onDeleteStore={handleDeleteStore}
          />
          
          <AddStoreForm 
            onAddStore={handleAddStore}
            isAddingStore={isAddingStore}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsPage;
