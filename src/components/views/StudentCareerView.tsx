import { useState } from "react";
import { GraduationCap, Briefcase, Plus, BookOpen, Scroll, Building2, Award, Sparkles, Loader2, CheckCircle2, X, Trash2 } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { generateStudentPlan, generateCareerRecommendations } from "@/lib/llm";

export function StudentCareerView({ mode }: { mode: "student" | "career" }) {
  const isStudent = mode === "student";
  const Icon = isStudent ? GraduationCap : Briefcase;
  
  const { 
    studentAssignments, studentExams, 
    careerApps, careerCerts, 
    addStudentAssignment, toggleStudentAssignment, deleteStudentAssignment, addStudentExam, deleteStudentExam,
    addCareerApp, updateCareerApp, deleteCareerApp, addCareerCert, deleteCareerCert
  } = useStore();

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Forms state
  const [isFormOpen, setIsFormOpen] = useState<"assignment" | "exam" | "app" | "cert" | null>(null);

  const [assignmentForm, setAssignmentForm] = useState({ course: "", title: "", dueDate: new Date().toISOString().slice(0,10) });
  const [examForm, setExamForm] = useState({ course: "", title: "", date: new Date().toISOString().slice(0,10) });
  const [appForm, setAppForm] = useState({ company: "", role: "", status: "Applied" as const, date: new Date().toISOString().slice(0,10) });
  const [certForm, setCertForm] = useState({ title: "", issuer: "", date: new Date().toISOString().slice(0,10) });

  const handleAiAdvice = async () => {
    setIsAiLoading(true);
    try {
      if (isStudent) {
        const res = await generateStudentPlan({ assignments: studentAssignments, exams: studentExams });
        setAiReport(res);
      } else {
        const res = await generateCareerRecommendations({ apps: careerApps, certs: careerCerts });
        setAiReport(res);
      }
    } catch (e) {
      setAiReport("Failed to generate AI report.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const submitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!assignmentForm.title) return;
    addStudentAssignment(assignmentForm);
    setIsFormOpen(null);
    setAssignmentForm({ course: "", title: "", dueDate: new Date().toISOString().slice(0,10) });
  };

  const submitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if(!examForm.title) return;
    addStudentExam(examForm);
    setIsFormOpen(null);
    setExamForm({ course: "", title: "", date: new Date().toISOString().slice(0,10) });
  };

  const submitApp = (e: React.FormEvent) => {
    e.preventDefault();
    if(!appForm.company) return;
    addCareerApp(appForm);
    setIsFormOpen(null);
    setAppForm({ company: "", role: "", status: "Applied", date: new Date().toISOString().slice(0,10) });
  };

  const submitCert = (e: React.FormEvent) => {
    e.preventDefault();
    if(!certForm.title) return;
    addCareerCert(certForm);
    setIsFormOpen(null);
    setCertForm({ title: "", issuer: "", date: new Date().toISOString().slice(0,10) });
  };

  return (
    <div className="animate-fade-up h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" /> {isStudent ? "Student Mode" : "Career Tracker"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isStudent ? "Manage assignments, exams, and study sessions." : "Track certifications, applications, and skill growth."}
          </p>
        </div>
        
        <button 
          onClick={handleAiAdvice}
          disabled={isAiLoading}
          className="gradient-primary h-10 px-4 rounded-xl text-primary-foreground font-semibold flex items-center gap-2 shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Get AI {isStudent ? "Study Plan" : "Career Advice"}
        </button>
      </div>

      {aiReport && (
        <div className="mb-6 glass rounded-2xl p-6 border border-accent/30 relative">
          <button onClick={() => setAiReport(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-3 text-accent font-semibold">
            <Sparkles className="h-5 w-5" /> AI Coach Report
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{aiReport}</div>
        </div>
      )}

      {isStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Assignments */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Assignments</h3>
              <button onClick={() => setIsFormOpen("assignment")} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {studentAssignments.length === 0 && <p className="text-sm text-muted-foreground text-center mt-10">No assignments tracked.</p>}
              {studentAssignments.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-start group">
                  <div>
                    <div className="text-xs font-semibold text-primary mb-1">{a.course}</div>
                    <div className={`font-medium mb-1 ${a.completed ? "line-through text-muted-foreground" : ""}`}>{a.title}</div>
                    <div className="text-xs text-muted-foreground">Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => deleteStudentAssignment(a.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleStudentAssignment(a.id)}>
                      {a.completed ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Exams */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2"><Scroll className="h-5 w-5 text-accent" /> Exams</h3>
              <button onClick={() => setIsFormOpen("exam")} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {studentExams.length === 0 && <p className="text-sm text-muted-foreground text-center mt-10">No exams tracked.</p>}
              {studentExams.map(e => (
                <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-start group">
                  <div>
                    <div className="text-xs font-semibold text-accent mb-1">{e.course}</div>
                    <div className="font-medium mb-1">{e.title}</div>
                    <div className="text-xs text-muted-foreground">Date: {new Date(e.date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => deleteStudentExam(e.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Applications */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Applications</h3>
              <button onClick={() => setIsFormOpen("app")} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {careerApps.length === 0 && <p className="text-sm text-muted-foreground text-center mt-10">No applications tracked.</p>}
              {careerApps.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{a.role}</div>
                      <div className="text-sm text-muted-foreground">{a.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => deleteCareerApp(a.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="text-xs px-2 py-1 bg-white/10 rounded-md">{a.date}</div>
                    </div>
                  </div>
                  <select 
                    value={a.status} 
                    onChange={e => updateCareerApp(a.id, e.target.value as any)}
                    className="text-xs bg-background border border-white/10 rounded-lg px-2 py-1 outline-none w-min mt-2"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          
          {/* Certifications */}
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-accent" /> Certifications</h3>
              <button onClick={() => setIsFormOpen("cert")} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {careerCerts.length === 0 && <p className="text-sm text-muted-foreground text-center mt-10">No certifications tracked.</p>}
              {careerCerts.map(c => (
                <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-start group">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{c.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{c.issuer}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Achieved: {new Date(c.date).toLocaleDateString()}</span>
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                  </div>
                  <button onClick={() => deleteCareerCert(c.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forms Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setIsFormOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-sm p-5 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg capitalize">New {isFormOpen}</h3>
              <button onClick={() => setIsFormOpen(null)}><X className="h-5 w-5" /></button>
            </div>
            
            {isFormOpen === "assignment" && (
              <form onSubmit={submitAssignment} className="space-y-4">
                <input required value={assignmentForm.course} onChange={e => setAssignmentForm({...assignmentForm, course: e.target.value})} className="input w-full" placeholder="Course Code" />
                <input required value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} className="input w-full" placeholder="Assignment Title" />
                <input type="date" required value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} className="input w-full" />
                <button type="submit" className="w-full gradient-primary text-white h-10 rounded-xl">Add Assignment</button>
              </form>
            )}

            {isFormOpen === "exam" && (
              <form onSubmit={submitExam} className="space-y-4">
                <input required value={examForm.course} onChange={e => setExamForm({...examForm, course: e.target.value})} className="input w-full" placeholder="Course Code" />
                <input required value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} className="input w-full" placeholder="Exam Title" />
                <input type="date" required value={examForm.date} onChange={e => setExamForm({...examForm, date: e.target.value})} className="input w-full" />
                <button type="submit" className="w-full gradient-primary text-white h-10 rounded-xl">Add Exam</button>
              </form>
            )}

            {isFormOpen === "app" && (
              <form onSubmit={submitApp} className="space-y-4">
                <input required value={appForm.company} onChange={e => setAppForm({...appForm, company: e.target.value})} className="input w-full" placeholder="Company Name" />
                <input required value={appForm.role} onChange={e => setAppForm({...appForm, role: e.target.value})} className="input w-full" placeholder="Role / Position" />
                <input type="date" required value={appForm.date} onChange={e => setAppForm({...appForm, date: e.target.value})} className="input w-full" />
                <button type="submit" className="w-full gradient-primary text-white h-10 rounded-xl">Track Application</button>
              </form>
            )}

            {isFormOpen === "cert" && (
              <form onSubmit={submitCert} className="space-y-4">
                <input required value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} className="input w-full" placeholder="Certification Title" />
                <input required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="input w-full" placeholder="Issuer (e.g., AWS, Coursera)" />
                <input type="date" required value={certForm.date} onChange={e => setCertForm({...certForm, date: e.target.value})} className="input w-full" />
                <button type="submit" className="w-full gradient-primary text-white h-10 rounded-xl">Add Certification</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
