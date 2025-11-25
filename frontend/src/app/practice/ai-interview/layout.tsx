import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Interview Practice | Preplyte",
  description: "Practice your interview skills with our AI-powered interviewer",
};

export default function AIInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}