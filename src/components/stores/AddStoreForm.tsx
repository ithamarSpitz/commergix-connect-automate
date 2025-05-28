import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddStoreFormProps {
  onAddStore: (storeName: string, platform: string) => Promise<void>;
  isAddingStore: boolean;
}

export const AddStoreForm = ({ onAddStore, isAddingStore }: AddStoreFormProps) => {
  const [newStoreName, setNewStoreName] = useState("");
  const [newStorePlatform, setNewStorePlatform] = useState("");

  const handleSubmit = async () => {
    await onAddStore(newStoreName, newStorePlatform);
    setNewStoreName("");
    setNewStorePlatform("");
  };

  return (
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
          <Select
            value={newStorePlatform}
            onValueChange={setNewStorePlatform}
          >
            <SelectTrigger id="storePlatform">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shopify">Shopify</SelectItem>
              <SelectItem value="mirakl">Mirakl</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={handleSubmit}
        disabled={isAddingStore || !newStoreName || !newStorePlatform}
      >
        {isAddingStore ? "Adding..." : "Add Store"}
      </Button>
    </div>
  );
};
