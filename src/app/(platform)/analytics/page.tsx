import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and identify areas for improvement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Breakdown</CardTitle>
            <CardDescription>
              Strengths and weaknesses by DSA topic — radar chart coming soon.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Score trends and improvement trajectory — charts coming soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
