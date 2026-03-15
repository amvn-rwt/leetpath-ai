import type { ReactNode } from "react";

export default function PracticeQuestionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="-m-6 h-[calc(100vh-3rem)] min-h-0">
      {children}
    </div>
  );
}
