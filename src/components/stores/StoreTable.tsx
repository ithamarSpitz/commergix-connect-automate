import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, ChevronDown } from "lucide-react";
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
import { Store } from "@/types";
import { StoreDeleteDialog } from "./StoreDeleteDialog";
import { ConnectStoreButton } from "./ConnectStoreButton";
import { ConnectMiraklButton } from "./ConnectMiraklButton";

interface StoreTableProps {
  stores: Store[];
  isLoading: boolean;
  onSyncStore: (storeId: string) => void;
  onDeleteStore: (storeId: string) => void;
  syncingStoreId?: string | null;
  onSelectStore?: (storeId: string | null) => void;
  selectedStoreId?: string | null;
}

export const StoreTable = ({ 
  stores, 
  isLoading, 
  onSyncStore,
  onDeleteStore,
  syncingStoreId = null,
  onSelectStore,
  selectedStoreId = null
}: StoreTableProps) => {
  if (isLoading) {
    return <p>Loading stores...</p>;
  }

  // Function to render the correct connection button based on platform
  const renderConnectionButton = (store: Store) => {
    if (store.status !== 'pending') return null;
    
    const platform = store.platform.toLowerCase();
    
    if (platform === 'shopify') {
      return (
        <ConnectStoreButton
          storeId={store.id}
          platform={store.platform}
        />
      );
    } else if (platform === 'mirakl') {
      return (
        <ConnectMiraklButton
          storeId={store.id}
        />
      );
    } else {
      // Generic connection button for other platforms
      return (
        <Button variant="outline" size="sm" disabled>
          Connect
        </Button>
      );
    }
  };

  // Function to render the sync button with loading state
  const renderSyncButton = (store: Store) => {
    const isSyncing = syncingStoreId === store.id;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSyncStore(store.id)}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </>
        )}
      </Button>
    );
  };

  const handleRowClick = (store: Store) => {
    if (onSelectStore) {
      if (selectedStoreId === store.id) {
        // If clicking on already selected row, deselect it
        onSelectStore(null);
      } else {
        onSelectStore(store.id);
      }
    }
  };

  return (
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
          <TableRow 
            key={connection.id} 
            className={selectedStoreId === connection.id 
              ? "bg-muted hover:bg-muted cursor-pointer" 
              : "hover:bg-muted/50 cursor-pointer"
            }
            onClick={() => handleRowClick(connection)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center">
                {selectedStoreId === connection.id && (
                  <ChevronDown className="mr-2 h-4 w-4" />
                )}
                {connection.store_name}
              </div>
            </TableCell>
            <TableCell>{connection.platform}</TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={connection.status === 'active' 
                  ? "text-green-600 bg-green-100" 
                  : "text-amber-600 bg-amber-100"
                }
              >
                {connection.status === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {connection.status === 'pending' ? (
                renderConnectionButton(connection)
              ) : (
                renderSyncButton(connection)
              )}
              <StoreDeleteDialog 
                storeId={connection.id} 
                onConfirmDelete={onDeleteStore} 
              />
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
  );
};
