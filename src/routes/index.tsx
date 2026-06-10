import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Splash } from "@/components/Splash";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRODEXA — Productivity OS" },
      { name: "description", content: "Organize, prioritize, and achieve with a futuristic task manager built for focused work." },
      { property: "og:title", content: "PRODEXA — Productivity OS" },
      { property: "og:description", content: "Organize, prioritize, and achieve with a futuristic task manager built for focused work." },
    ],
  }),
  component: App,
});

type Stage = "splash" | "login" | "dashboard";

function App() {
  const [stage, setStage] = useState<Stage>("splash");
  const [user, setUser] = useState<User | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (splashDone) {
        setStage(currentUser ? "dashboard" : "login");
      }
    });
    return () => unsubscribe();
  }, [splashDone]);

  const handleSplashDone = () => {
    setSplashDone(true);
    setStage(user ? "dashboard" : "login");
  };

  return (
    <>
      {stage === "splash" && <Splash onDone={handleSplashDone} />}
      {stage === "login" && <Login />}
      {stage === "dashboard" && user && <Dashboard user={user} />}
      <Toaster position="top-right" theme="dark" richColors />
    </>
  );
}
