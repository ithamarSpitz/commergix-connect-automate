import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/hooks/useSupabase";
import { Store } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ConnectionsPage = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStorePlatform, setNewStorePlatform] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
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
          setStores(data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStores();
  }, [user]);
  
  const handleAddStore = async () => {
    if (!user || !newStoreName || !newStorePlatform) {
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
          store_name: newStoreName,
          platform: newStorePlatform,
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
      } else {
        setStores([...stores, data]);
        setNewStoreName("");
        setNewStorePlatform("");
        toast({
          title: "Store Added",
          description: "Store added successfully",
        });
      }
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
          {isLoading ? (
            <p>Loading stores...</p>
          ) : (
            <Table>
              <TableCaption>A list of your connected stores.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>{connection.store_name}</TableCell>
                    <TableCell>{connection.platform}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-amber-600 bg-amber-100">
                        {connection.status === 'connected' ? 'Active' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSyncStore(connection.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your store
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStore(connection.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    Total {stores.length} store(s) connected.
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
          
          <div className="mt-4 border rounded-md p-4">
            <h4 className="mb-2 font-semibold">Add New Store</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  type="text"
                  id="storeName"
                  placeholder="My Store"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="storePlatform">Platform</Label>
                <Input
                  type="text"
                  id="storePlatform"
                  placeholder="Shopify"
                  value={newStorePlatform}
                  onChange={(e) => setNewStorePlatform(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={handleAddStore}
              disabled={isAddingStore}
            >
              {isAddingStore ? "Adding..." : "Add Store"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsPage;
