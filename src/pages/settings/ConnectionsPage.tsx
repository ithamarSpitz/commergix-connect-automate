import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { Store, StoreStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StoreTable } from "@/components/stores/StoreTable";
import { AddStoreForm } from "@/components/stores/AddStoreForm";
import { useStoreSync } from "@/hooks/useStoreSync";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const { toast } = useToast();
  const storeSync = useStoreSync();
  
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
    console.log('[ConnectionsPage] Starting sync for store ID:', storeId);
    
    const store = stores.find(s => s.id === storeId);
    if (!store) {
      console.error('[ConnectionsPage] Store not found with ID:', storeId);
      toast({
        title: "Error",
        description: "Store not found",
        variant: "destructive",
      });
      return;
    }

    // Set syncing status to show loading indicator
    setSyncingStoreId(storeId);
    // Select this store to show its logs
    setSelectedStoreId(storeId);
    
    console.log('[ConnectionsPage] Store found:', store);
    
    toast({
      title: "Sync Initiated",
      description: `Synchronizing data from ${store.store_name}...`,
    });

    try {
      // Use our sync service to sync all data from the store
      console.log('[ConnectionsPage] Calling storeSync.syncAll...');
      const result = await storeSync.syncAll(store);
      console.log('[ConnectionsPage] Sync completed with result:', result);
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: result.message,
        });
      } else {
        console.warn('[ConnectionsPage] Sync completed with errors:', result.message);
        toast({
          title: "Sync Warning",
          description: result.message,
          variant: "destructive",
        });
      }

      // Refresh the stores list to show any updates
      console.log('[ConnectionsPage] Refreshing stores list...');
      await fetchStores();
      
      // Force refresh of sync logs by doing a state update
      console.log('[ConnectionsPage] Forcing refresh of selected store...');
      setSelectedStoreId(null);
      setTimeout(() => setSelectedStoreId(storeId), 100);
      
    } catch (error) {
      console.error("[ConnectionsPage] Error syncing store:", error);
      toast({
        title: "Sync Error",
        description: `Failed to sync store: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSyncingStoreId(null);
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
        <CardContent className="space-y-6">
          <StoreTable 
            stores={stores}
            isLoading={isLoading}
            onSyncStore={handleSyncStore}
            onDeleteStore={handleDeleteStore}
            syncingStoreId={syncingStoreId}
            onSelectStore={setSelectedStoreId}
            selectedStoreId={selectedStoreId}
          />
          
          <AddStoreForm 
            onAddStore={handleAddStore}
            isAddingStore={isAddingStore}
          />
          
          {selectedStoreId && (
            <>
              <Separator className="my-4" />
              {/* <SyncLogsList storeId={selectedStoreId} limit={5} /> */}
            </>
          )}
          
          {!selectedStoreId && stores.length > 0 && (
            <>
              <Separator className="my-4" />
              {/* <SyncLogsList limit={10} /> */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsPage;
