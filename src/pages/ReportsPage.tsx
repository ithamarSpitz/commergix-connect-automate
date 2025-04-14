
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function ReportsPage() {
  const [reportText, setReportText] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement AI analysis logic here
      toast({
        title: "Success",
        description: "Report submitted for analysis",
      });
      setReportText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Report Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your report text here..."
              className="min-h-[200px]"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <Button 
              onClick={handleSubmit}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Analyze Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
