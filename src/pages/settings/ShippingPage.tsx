
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Save, Truck } from "lucide-react";

const ShippingPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for demonstration
  const [chinaShippingApi, setChinaShippingApi] = useState("");
  const [dhlExpressId, setDhlExpressId] = useState("");
  const [dhlExpressSecret, setDhlExpressSecret] = useState("");
  
  const [defaultRules, setDefaultRules] = useState([
    { id: "rule1", minWeight: 0, maxWeight: 1, carrier: "chita", description: "Light packages (≤ 1 kg)" },
    { id: "rule2", minWeight: 1, maxWeight: 5, carrier: "dhl", description: "Medium packages (1-5 kg)" },
    { id: "rule3", minWeight: 5, maxWeight: null, carrier: "dhl", description: "Heavy packages (> 5 kg)" },
  ]);
  
  const handleSaveApiKeys = async () => {
    setIsLoading(true);
    
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Shipping Settings Saved",
        description: "Your shipping API keys have been updated.",
      });
    } catch (error) {
      console.error("Error saving shipping settings:", error);
      
      toast({
        title: "Save Failed",
        description: "There was an error saving your shipping settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addShippingRule = () => {
    const newRule = {
      id: `rule${defaultRules.length + 1}`,
      minWeight: 0,
      maxWeight: 1,
      carrier: "chita",
      description: "New shipping rule",
    };
    
    setDefaultRules([...defaultRules, newRule]);
  };
  
  const removeShippingRule = (ruleId) => {
    setDefaultRules(defaultRules.filter(rule => rule.id !== ruleId));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shipping Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure your shipping providers and create automated shipping rules.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Chita Shipping</CardTitle>
                <CardDescription>For domestic shipments within Israel</CardDescription>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="chita-api">API Token</Label>
                <Input
                  id="chita-api"
                  type="password"
                  placeholder="Enter your Chita API token"
                  value={chinaShippingApi}
                  onChange={(e) => setChinaShippingApi(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API token from the Chita dashboard
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>DHL Express</CardTitle>
                <CardDescription>For international shipments</CardDescription>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="dhl-client-id">Client ID</Label>
                <Input
                  id="dhl-client-id"
                  placeholder="DHL client ID"
                  value={dhlExpressId}
                  onChange={(e) => setDhlExpressId(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dhl-client-secret">Client Secret</Label>
                <Input
                  id="dhl-client-secret"
                  type="password"
                  placeholder="DHL client secret"
                  value={dhlExpressSecret}
                  onChange={(e) => setDhlExpressSecret(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API credentials from the DHL Developer Portal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button onClick={handleSaveApiKeys} disabled={isLoading}>
        <Save className="mr-2 h-4 w-4" />
        {isLoading ? "Saving..." : "Save API Keys"}
      </Button>
      
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Shipping Rules</h3>
            <p className="text-sm text-muted-foreground">
              Configure automated shipping carrier selection based on package weight
            </p>
          </div>
          <Button size="sm" onClick={addShippingRule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
        
        <div className="space-y-4">
          {defaultRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-base font-medium">{rule.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      Weight range: {rule.minWeight} kg {rule.maxWeight ? `to ${rule.maxWeight} kg` : 'and above'}
                    </p>
                    <p className="text-sm">
                      Carrier: <span className="font-medium">{rule.carrier === 'chita' ? 'Chita Shipping' : 'DHL Express'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500"
                      onClick={() => removeShippingRule(rule.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
