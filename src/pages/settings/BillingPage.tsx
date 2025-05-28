
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { CreditCard, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const BillingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<'paygo' | 'pro' | null>(null);
  const { initiateCheckout, isLoading } = useStripeCheckout();
  
  // Mock data for demonstration
  const currentPlan = "free";
  const usageCounts = {
    currentMonth: 32,
    limit: 100,
  };
  
  const recentInvoices = [
    {
      id: "inv_123",
      date: "2023-04-01",
      amount: 0,
      status: "paid",
      description: "Free tier - April 2023",
    },
    {
      id: "inv_122",
      date: "2023-03-01",
      amount: 0,
      status: "paid",
      description: "Free tier - March 2023",
    },
  ];
  
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      interval: "",
      description: "For individuals just getting started",
      features: [
        "Up to 100 actions per month",
        "Basic product management",
        "Manual order fulfillment",
        "Email support",
      ],
      limitations: [
        "Limited to 1 store connection",
      ],
      cta: "Current Plan",
      recommended: false,
      disabled: true,
    },
    {
      id: "paygo",
      name: "Pay-as-you-Go",
      price: "$0",
      interval: "+ $0.25 per action",
      description: "For growing businesses with variable needs",
      features: [
        "Unlimited actions (pay per use)",
        "Advanced product management",
        "Automated order fulfillment",
        "Priority email support",
        "Up to 3 store connections",
      ],
      limitations: [],
      cta: "Upgrade",
      recommended: false,
      disabled: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      interval: "/month",
      description: "For established businesses with consistent volume",
      features: [
        "Unlimited actions",
        "Advanced analytics dashboard",
        "Bulk operations",
        "Priority email & phone support",
        "Unlimited store connections",
        "API access",
      ],
      limitations: [],
      cta: "Upgrade",
      recommended: true,
      disabled: false,
    },
  ];
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleSelectPlan = (planId: 'paygo' | 'pro') => {
    setSelectedPlan(planId);
  };
  
  const handleUpgrade = () => {
    if (selectedPlan) {
      initiateCheckout(selectedPlan);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing & Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription plan and billing information.
        </p>
      </div>
      
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Current Plan: {currentPlan === "free" ? "Free" : currentPlan === "paygo" ? "Pay-as-you-Go" : "Pro"}</AlertTitle>
        <AlertDescription>
          {currentPlan === "free" 
            ? `You've used ${usageCounts.currentMonth} of ${usageCounts.limit} actions this month.`
            : currentPlan === "paygo"
            ? "You're being billed based on your usage. No monthly limits."
            : "You're on the Pro plan with unlimited actions."}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.recommended ? 'border-primary' : ''} ${plan.id === currentPlan ? 'bg-secondary/20' : ''}`}
          >
            <CardHeader>
              {plan.recommended && (
                <Badge className="self-start bg-primary mb-2">Recommended</Badge>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{plan.interval}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-center text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.id === currentPlan ? "secondary" : plan.recommended ? "default" : "outline"}
                className="w-full"
                disabled={plan.disabled || plan.id === currentPlan || isLoading}
                onClick={() => handleSelectPlan(plan.id as 'paygo' | 'pro')}
              >
                {plan.id === currentPlan ? "Current Plan" : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedPlan && (
        <Card className="bg-primary/5 border-primary/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-base font-medium">
                  Upgrade to {selectedPlan === "paygo" ? "Pay-as-you-Go" : "Pro"} Plan
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan === "paygo" 
                    ? "You'll be charged $0.25 per action with no monthly fee."
                    : "You'll be charged $49 per month for unlimited actions."}
                </p>
              </div>
              <Button onClick={handleUpgrade} disabled={isLoading}>
                {isLoading ? "Processing..." : "Proceed to Checkout"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Billing History</h3>
        
        <div className="space-y-4">
          {recentInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()} • Invoice #{invoice.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                    {getStatusBadge(invoice.status)}
                    <Button variant="outline" size="sm">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Receipt
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

export default BillingPage;
