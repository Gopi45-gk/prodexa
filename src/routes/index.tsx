import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { Splash } from "@/components/Splash";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskForge — Smart Task Manager" },
      { name: "description", content: "Organize, prioritize, and achieve with a futuristic task manager built for focused work." },
      { property: "og:title", content: "TaskForge — Smart Task Manager" },
      { property: "og:description", content: "Organize, prioritize, and achieve with a futuristic task manager built for focused work." },
    ],
  }),
  component: App,
});

type Stage = "splash" | "login" | "dashboard";

function App() {
  const [stage, setStage] = useState<Stage>("splash");
  const [user, setUser] = useState("alex");

  return (
    <>
      {stage === "splash" && <Splash onDone={() => setStage("login")} />}
      {stage === "login" && <Login onSuccess={(n) => { setUser(n); setStage("dashboard"); }} />}
      {stage === "dashboard" && <Dashboard user={user} onLogout={() => setStage("login")} />}
      <Toaster position="top-right" theme="dark" richColors />
    </>
  );
}
