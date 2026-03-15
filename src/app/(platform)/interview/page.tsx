"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DSA_TOPICS, type Difficulty, type DSATopic } from "@/types";
import { Loader2Icon } from "lucide-react";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const DURATION_OPTIONS = [30, 45, 60];

export default function InterviewPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<DSATopic[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [duration, setDuration] = useState(45);
  const [companyStyle, setCompanyStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (topic: DSATopic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) {
      setError("Select at least one topic");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: selectedTopics,
          difficulty,
          duration,
          companyStyle: companyStyle.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to start interview");
      }
      const session = await res.json();
      setOpen(false);
      router.push(`/interview/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

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
            and topic focus. A unique coding question will be generated for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button>Configure Interview</Button>} />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configure Interview</DialogTitle>
                <DialogDescription>
                  Choose topics and difficulty. An AI-generated question will be
                  created for this session.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Topics</Label>
                  <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                    {DSA_TOPICS.map((topic) => (
                      <label
                        key={topic}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTopics.includes(topic)}
                          onChange={() => toggleTopic(topic)}
                          className="rounded border-input"
                        />
                        {topic}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v) => setDifficulty(v as Difficulty)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(
                        (d) => (
                          <SelectItem key={d} value={d}>
                            {DIFFICULTY_LABELS[d]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration (minutes)</Label>
                  <Select
                    value={String(duration)}
                    onValueChange={(v) => setDuration(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Company style (optional)</Label>
                  <Input
                    placeholder="e.g. FAANG, startup"
                    value={companyStyle}
                    onChange={(e) => setCompanyStyle(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleStart} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
