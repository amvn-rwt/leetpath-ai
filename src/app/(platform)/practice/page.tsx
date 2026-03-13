import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice</h1>
          <p className="text-muted-foreground">Browse and solve AI-generated coding problems.</p>
        </div>
        <Button>Generate New Question</Button>
      </div>

      <Card>
        <CardHeader className="text-center py-12">
          <CardTitle>No questions yet</CardTitle>
          <CardDescription>
            Click &quot;Generate New Question&quot; to get an AI-powered coding problem
            tailored to your skill level.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
