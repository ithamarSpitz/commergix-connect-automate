
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Welcome to commegix",
      description: "Let's get your account set up and ready to go.",
      content: (
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium">Your account is created</h3>
          <p className="text-center text-muted-foreground">
            Now it's time to connect your stores and set up your shipping preferences.
          </p>
        </div>
      ),
    },
    {
      title: "Connect Your Store",
      description: "Link your existing e-commerce platform.",
      content: (
        <div className="grid gap-4 py-4">
          <Button className="w-full" variant="outline">
            Connect Shopify
          </Button>
          <Button className="w-full" variant="outline">
            Connect Mirakl
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            You can add more connections later in settings.
          </p>
        </div>
      ),
    },
    {
      title: "Shipping Settings",
      description: "Set up your shipping preferences.",
      content: (
        <div className="flex flex-col space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button className="w-full" variant="outline">
              Chita Shipping
            </Button>
            <Button className="w-full" variant="outline">
              DHL Express
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            You can configure more shipping options in settings.
          </p>
        </div>
      ),
    },
    {
      title: "All Set!",
      description: "You're ready to start using commegix.",
      content: (
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="rounded-full bg-green-100 p-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium">Setup Complete</h3>
          <p className="text-center text-muted-foreground">
            You've successfully set up your commegix account. You can now start managing your products and orders.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>{currentStep.content}</CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {step < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Go to Dashboard"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingPage;
