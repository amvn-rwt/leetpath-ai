import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InterviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mock Interview</h1>
        <p className="text-muted-foreground">
          Simulate a real coding interview with an AI interviewer.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Start a New Interview</CardTitle>
          <CardDescription>
            Configure your mock interview session — choose duration, difficulty,
            and topic focus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Configure Interview</Button>
        </CardContent>
      </Card>
    </div>
  );
}
