import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

// --- Data Types ---
export type View = 
  | "Dashboard" | "Tasks" | "Goals" | "Habits" | "Focus Hub" | "Calendar" 
  | "Analytics" | "AI Coach" | "Achievements" | "Student Mode" | "Career Tracker"
  | "Settings" | "Profile";

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed" | "Archived";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  tags: string[];
  dueDate: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
};

export type Goal = {
  id: string;
  title: string;
  type: "Daily" | "Weekly" | "Monthly" | "Yearly";
  progress: number;
  target: number;
  deadline: string;
};

export type Habit = {
  id: string;
  name: string;
  completions: string[]; // ISO date strings
  streak: number;
  icon?: string;
};

export type FocusSession = {
  id: string;
  durationMinutes: number;
  date: string;
};

export type Mood = "Happy" | "Good" | "Neutral" | "Tired" | "Stressed";
export type MoodEntry = { date: string; mood: Mood };

export type Activity = {
  id: string;
  type: "added" | "updated" | "completed" | "deleted" | "goal" | "habit" | "focus" | "achievement";
  title: string;
  at: number;
};

export type CalendarEvent = { id: string; title: string; date: string; type: "Task" | "Goal" | "Event"; description?: string };
export type StudentAssignment = { id: string; course: string; title: string; dueDate: string; completed: boolean };
export type StudentExam = { id: string; course: string; title: string; date: string };
export type CareerApp = { id: string; company: string; role: string; status: "Applied" | "Interview" | "Offer" | "Rejected"; date: string };
export type CareerCert = { id: string; title: string; issuer: string; date: string };
export type AIReport = { id: string; type: string; content: string; date: string };
export type Notification = { id: string; message: string; type: string; read: boolean; at: number };

export type StoreState = {
  view: View;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  focusSessions: FocusSession[];
  moods: MoodEntry[];
  activity: Activity[];
  xp: number;
  level: number;
  dark: boolean;
  calendarEvents: CalendarEvent[];
  studentAssignments: StudentAssignment[];
  studentExams: StudentExam[];
  careerApps: CareerApp[];
  careerCerts: CareerCert[];
  aiReports: AIReport[];
  notifications: Notification[];
};

export type StoreActions = {
  setView: (v: View) => void;
  addTask: (t: Omit<Task, "id" | "createdAt" | "status">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  toggleHabit: (id: string, date: string) => void;
  addHabit: (name: string, icon?: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
  logFocusSession: (minutes: number) => void;
  logMood: (mood: Mood) => void;
  toggleTheme: () => void;
  clearData: () => void;
  // New actions
  addCalendarEvent: (e: Omit<CalendarEvent, "id">) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addStudentAssignment: (a: Omit<StudentAssignment, "id" | "completed">) => void;
  toggleStudentAssignment: (id: string) => void;
  deleteStudentAssignment: (id: string) => void;
  addStudentExam: (e: Omit<StudentExam, "id">) => void;
  deleteStudentExam: (id: string) => void;
  addCareerApp: (a: Omit<CareerApp, "id">) => void;
  updateCareerApp: (id: string, status: CareerApp["status"]) => void;
  deleteCareerApp: (id: string) => void;
  addCareerCert: (c: Omit<CareerCert, "id">) => void;
  deleteCareerCert: (id: string) => void;
  saveAIReport: (type: string, content: string) => void;
  markNotificationsRead: () => void;
};

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

const STORAGE_KEY = "prodexa.state.v3";

const initialState: StoreState = {
  view: "Dashboard",
  tasks: [],
  goals: [],
  habits: [],
  focusSessions: [],
  moods: [],
  activity: [],
  xp: 0,
  level: 1,
  dark: true,
  calendarEvents: [],
  studentAssignments: [],
  studentExams: [],
  careerApps: [],
  careerCerts: [],
  aiReports: [],
  notifications: []
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const savingRef = useRef(false);

  // Handle Auth and Firebase Sync Initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setState(s => ({ ...initialState, ...docSnap.data(), view: s.view }));
          } else {
            // New user, save initial state
            await setDoc(docRef, initialState);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          // Fallback to local storage
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setState(s => ({ ...initialState, ...JSON.parse(raw), view: s.view }));
        }
      } else {
        // Logged out, load local
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState(s => ({ ...initialState, ...JSON.parse(raw), view: s.view }));
        else setState(initialState);
      }
      setLoaded(true);
    });

    const theme = localStorage.getItem("prodexa.theme");
    if (theme === "light") {
      setState(s => ({ ...s, dark: false }));
      document.documentElement.classList.add("light");
    }

    return () => unsubscribe();
  }, []);

  // Sync state to Firebase / LocalStorage on change
  useEffect(() => {
    if (!loaded) return;
    
    // Save to local storage
    const stateToSave = { ...state, view: "Dashboard" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

    // Debounced save to Firebase
    if (user) {
      if (savingRef.current) return;
      savingRef.current = true;
      setTimeout(async () => {
        try {
          await setDoc(doc(db, "users", user.uid), stateToSave);
        } catch (error) {
          console.error("Failed to sync to Firestore", error);
        } finally {
          savingRef.current = false;
        }
      }, 2000);
    }
  }, [state, loaded, user]);

  const addXP = (amount: number, reason: string) => {
    setState(s => {
      let newXp = s.xp + amount;
      let newLevel = s.level;
      if (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
        toast.success(`Level Up! You are now Level ${newLevel} 🎉`);
      }
      return { ...s, xp: newXp, level: newLevel };
    });
  };

  const pushActivity = (type: Activity["type"], title: string) => {
    setState(s => ({
      ...s,
      activity: [{ id: crypto.randomUUID(), type, title, at: Date.now() }, ...s.activity].slice(0, 50)
    }));
  };
  
  const pushNotification = (message: string, type: string) => {
    setState(s => ({
      ...s,
      notifications: [{ id: crypto.randomUUID(), message, type, read: false, at: Date.now() }, ...s.notifications].slice(0, 50)
    }));
  }

  const actions: StoreActions = {
    setView: (v) => setState(s => ({ ...s, view: v })),
    
    addTask: (t) => {
      setState(s => ({
        ...s,
        tasks: [{ ...t, id: crypto.randomUUID(), createdAt: Date.now(), status: "To Do" }, ...s.tasks]
      }));
      pushActivity("added", t.title);
      pushNotification(`New task added: ${t.title}`, "task");
      addXP(5, "Task Added");
      toast.success("Task created");
    },
    
    updateTask: (id, updates) => {
      setState(s => {
        const task = s.tasks.find(x => x.id === id);
        if (!task) return s;
        const newlyCompleted = updates.status === "Completed" && task.status !== "Completed";
        
        const newTasks = s.tasks.map(t => t.id === id ? { 
          ...t, 
          ...updates, 
          ...(newlyCompleted ? { completedAt: Date.now() } : {}) 
        } : t);
        
        return { ...s, tasks: newTasks };
      });
      if (updates.status === "Completed") {
        pushActivity("completed", "Task completed");
        pushNotification("Task completed! +20 XP", "achievement");
        addXP(20, "Task Completed");
      } else {
        pushActivity("updated", "Task updated");
      }
    },
    
    deleteTask: (id) => {
      setState(s => {
        const task = s.tasks.find(x => x.id === id);
        if (task) pushActivity("deleted", task.title);
        return { ...s, tasks: s.tasks.filter(t => t.id !== id) };
      });
      toast.success("Task deleted");
    },

    addGoal: (g) => {
      setState(s => ({
        ...s,
        goals: [{ ...g, id: crypto.randomUUID() }, ...s.goals]
      }));
      pushActivity("goal", `Goal created: ${g.title}`);
      toast.success("Goal added");
    },

    updateGoal: (id, updates) => {
      setState(s => ({
        ...s,
        goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      }));
    },

    deleteGoal: (id) => {
      setState(s => ({
        ...s,
        goals: s.goals.filter(g => g.id !== id)
      }));
      toast.success("Goal deleted");
    },

    updateGoalProgress: (id, progress) => {
      setState(s => {
        const newGoals = s.goals.map(g => g.id === id ? { ...g, progress } : g);
        const goal = newGoals.find(g => g.id === id);
        if (goal && goal.progress >= goal.target && progress >= goal.target) {
          pushActivity("goal", `Goal Achieved: ${goal.title}`);
          pushNotification(`Goal Achieved: ${goal.title} 🎉`, "achievement");
          setTimeout(() => addXP(50, "Goal Achieved"), 100);
          toast.success("Goal Achieved! 🎉");
        }
        return { ...s, goals: newGoals };
      });
    },

    toggleHabit: (id, date) => {
      setState(s => {
        const newHabits = s.habits.map(h => {
          if (h.id !== id) return h;
          const isDone = h.completions.includes(date);
          const newComps = isDone ? h.completions.filter(d => d !== date) : [...h.completions, date];
          const streak = newComps.length; 
          if (!isDone) {
            pushActivity("habit", `Habit done: ${h.name}`);
            setTimeout(() => addXP(10, "Habit Completed"), 100);
          }
          return { ...h, completions: newComps, streak };
        });
        return { ...s, habits: newHabits };
      });
    },

    addHabit: (name, icon) => {
      setState(s => ({
        ...s,
        habits: [...s.habits, { id: crypto.randomUUID(), name, completions: [], streak: 0, icon }]
      }));
      toast.success("Habit added");
    },

    updateHabit: (id, name) => {
      setState(s => ({
        ...s,
        habits: s.habits.map(h => h.id === id ? { ...h, name } : h)
      }));
    },

    deleteHabit: (id) => {
      setState(s => ({
        ...s,
        habits: s.habits.filter(h => h.id !== id)
      }));
      toast.success("Habit deleted");
    },

    logFocusSession: (minutes) => {
      setState(s => ({
        ...s,
        focusSessions: [...s.focusSessions, { id: crypto.randomUUID(), durationMinutes: minutes, date: new Date().toISOString() }]
      }));
      pushActivity("focus", `Completed ${minutes}m focus session`);
      pushNotification(`Deep Focus: ${minutes}m completed`, "focus");
      addXP(minutes, "Focus Session");
      toast.success("Focus session logged!");
    },

    logMood: (mood) => {
      setState(s => {
        const date = new Date().toISOString().slice(0, 10);
        const filtered = s.moods.filter(m => m.date !== date);
        return { ...s, moods: [...filtered, { date, mood }] };
      });
      toast.success(`Mood logged: ${mood}`);
    },

    toggleTheme: () => {
      setState(s => {
        const next = !s.dark;
        document.documentElement.classList.toggle("light", !next);
        localStorage.setItem("prodexa.theme", next ? "dark" : "light");
        toast(next ? "Dark mode on" : "Light mode on");
        return { ...s, dark: next };
      });
    },

    clearData: () => {
      localStorage.removeItem(STORAGE_KEY);
      if (user) {
        setDoc(doc(db, "users", user.uid), initialState);
      }
      setState(initialState);
      toast.success("All data cleared");
    },
    
    addCalendarEvent: (e) => {
      setState(s => ({
        ...s,
        calendarEvents: [...s.calendarEvents, { ...e, id: crypto.randomUUID() }]
      }));
      toast.success("Event added");
    },

    updateCalendarEvent: (id, updates) => {
      setState(s => ({
        ...s,
        calendarEvents: s.calendarEvents.map(e => e.id === id ? { ...e, ...updates } : e)
      }));
    },

    deleteCalendarEvent: (id) => {
      setState(s => ({
        ...s,
        calendarEvents: s.calendarEvents.filter(e => e.id !== id)
      }));
      toast.success("Event deleted");
    },
    
    addStudentAssignment: (a) => {
      setState(s => ({ ...s, studentAssignments: [...s.studentAssignments, { ...a, id: crypto.randomUUID(), completed: false }] }));
      toast.success("Assignment tracked");
    },
    
    toggleStudentAssignment: (id) => {
      setState(s => ({ ...s, studentAssignments: s.studentAssignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a) }));
    },

    deleteStudentAssignment: (id) => {
      setState(s => ({ ...s, studentAssignments: s.studentAssignments.filter(a => a.id !== id) }));
    },
    
    addStudentExam: (e) => {
      setState(s => ({ ...s, studentExams: [...s.studentExams, { ...e, id: crypto.randomUUID() }] }));
      toast.success("Exam tracked");
    },

    deleteStudentExam: (id) => {
      setState(s => ({ ...s, studentExams: s.studentExams.filter(e => e.id !== id) }));
    },
    
    addCareerApp: (a) => {
      setState(s => ({ ...s, careerApps: [...s.careerApps, { ...a, id: crypto.randomUUID() }] }));
      toast.success("Application tracked");
    },
    
    updateCareerApp: (id, status) => {
      setState(s => ({
        ...s,
        careerApps: s.careerApps.map(a => a.id === id ? { ...a, status } : a)
      }));
    },

    deleteCareerApp: (id) => {
      setState(s => ({ ...s, careerApps: s.careerApps.filter(a => a.id !== id) }));
    },
    
    addCareerCert: (c) => {
      setState(s => ({ ...s, careerCerts: [...s.careerCerts, { ...c, id: crypto.randomUUID() }] }));
      toast.success("Certification tracked");
    },

    deleteCareerCert: (id) => {
      setState(s => ({ ...s, careerCerts: s.careerCerts.filter(c => c.id !== id) }));
    },
    
    saveAIReport: (type, content) => {
      setState(s => {
        const filtered = s.aiReports.filter(r => r.type !== type || r.date !== new Date().toISOString().slice(0, 10));
        return {
          ...s,
          aiReports: [...filtered, { id: crypto.randomUUID(), type, content, date: new Date().toISOString().slice(0, 10) }]
        };
      });
    },
    
    markNotificationsRead: () => {
      setState(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }));
    }
  };

  if (!loaded) return null;

  return (
    <StoreContext.Provider value={{ ...state, ...actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
