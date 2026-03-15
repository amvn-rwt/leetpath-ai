"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { DSA_TOPICS, type Difficulty, type DSATopic } from "@/types";
import { Loader2Icon } from "lucide-react";

type QuestionListItem = {
  id: string;
  title: string;
  difficulty: string;
  topics: string[];
  createdAt: string;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export default function PracticePage() {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<DSATopic[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to fetch questions");
      }
      const data = await res.json();
      setQuestions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleTopic = (topic: DSATopic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      setError("Select at least one topic");
      return;
    }
    setGenerateLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: selectedTopics, difficulty }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate question");
      }
      const saved = await res.json();
      setOpen(false);
      setSelectedTopics([]);
      setDifficulty("MEDIUM");
      await fetchQuestions();
      window.location.href = `/practice/${saved.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate question");
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice</h1>
          <p className="text-muted-foreground">
            Browse and solve AI-generated coding problems.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button>Generate New Question</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Question</DialogTitle>
              <DialogDescription>
                Choose one or more topics and difficulty. The AI will create a
                tailored coding problem.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Topics</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
                  {DSA_TOPICS.map((topic) => (
                    <label
                      key={topic}
                      className="flex items-center gap-2 text-sm cursor-pointer"
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
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={generateLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generateLoading}>
                {generateLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardHeader className="text-center py-12">
            <Loader2Icon className="mx-auto size-8 animate-spin text-muted-foreground" />
            <CardTitle>Loading questions</CardTitle>
            <CardDescription>Fetching your practice questions.</CardDescription>
          </CardHeader>
        </Card>
      ) : error && questions.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <CardTitle>Could not load questions</CardTitle>
            <CardDescription>{error}</CardDescription>
            <Button variant="outline" onClick={fetchQuestions} className="mt-4">
              Retry
            </Button>
          </CardHeader>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <CardTitle>No questions yet</CardTitle>
            <CardDescription>
              Click &quot;Generate New Question&quot; to get an AI-powered coding
              problem tailored to your skill level.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => (
            <Link key={q.id} href={`/practice/${q.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">{q.title}</CardTitle>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="secondary" className="text-xs">
                      {DIFFICULTY_LABELS[q.difficulty as Difficulty] ?? q.difficulty}
                    </Badge>
                    {q.topics.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
