export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex-1 rounded-lg border p-6">
        <h2 className="text-xl font-bold">Interview Session</h2>
        <p className="mt-2 text-muted-foreground">
          Loading interview {id}...
        </p>
      </div>

      <div className="flex-1 rounded-lg border p-4">
        <p className="text-muted-foreground">Chat and code editor will be mounted here.</p>
      </div>
    </div>
  );
}
