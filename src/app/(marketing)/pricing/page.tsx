import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free and upgrade as you grow.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <p className="text-3xl font-bold">$0</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>5 AI-generated questions/day</li>
              <li>Basic code scoring</li>
              <li>1 mock interview/week</li>
              <li>Progress dashboard</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Pro</CardTitle>
              <Badge>Coming Soon</Badge>
            </div>
            <CardDescription>For serious interview prep</CardDescription>
            <p className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Unlimited AI questions</li>
              <li>Advanced AI scoring & feedback</li>
              <li>Unlimited mock interviews</li>
              <li>Company-specific prep</li>
              <li>Advanced analytics</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>Coming Soon</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
