import { useState } from "react";
import { useStore, Task, TaskStatus, Priority } from "@/contexts/StoreContext";
import { Plus, GripVertical, CheckCircle2, Clock, MoreVertical, Flame, AlertTriangle, Calendar as CalIcon, LayoutGrid, List, X, Search, Sparkles, Trash2, Edit2, Loader2, Copy, RotateCcw, Archive } from "lucide-react";
import { generateSmartPriority } from "@/lib/llm";

export function TaskWorkspace() {
  const { tasks, updateTask, addTask, deleteTask } = useStore();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [tab, setTab] = useState<"All" | "Pending" | "In Progress" | "Completed" | "Archived">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as Priority,
    category: "",
    dueDate: new Date().toISOString().slice(0, 10),
  });
  
  const [isAiTriaging, setIsAiTriaging] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openNewTask = () => {
    setEditingTaskId(null);
    setTaskForm({ title: "", description: "", priority: "Medium", category: "", dueDate: new Date().toISOString().slice(0, 10) });
    setIsTaskFormOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate
    });
    setIsTaskFormOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    
    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        category: taskForm.category || "General",
        dueDate: taskForm.dueDate,
      });
    } else {
      addTask({
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        category: taskForm.category || "General",
        tags: [],
        dueDate: taskForm.dueDate,
      });
    }
    
    setIsTaskFormOpen(false);
  };

  const handleAiTriage = async () => {
    if (!taskForm.title) return;
    setIsAiTriaging(true);
    try {
      const priority = await generateSmartPriority(taskForm.title, taskForm.description, taskForm.dueDate);
      setTaskForm(prev => ({ ...prev, priority: priority as Priority }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiTriaging(false);
    }
  };

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status });
      setDraggedTaskId(null);
    }
  };

  // Smart Priority Engine
  const getAiRecommendation = (task: Task) => {
    const today = new Date().toISOString().slice(0, 10);
    if (task.status === "Completed" || task.status === "Archived") return null;
    if (task.dueDate < today) return { icon: AlertTriangle, label: "Overdue", color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (task.dueDate === today && task.priority === "High") return { icon: Flame, label: "Do Today", color: "text-accent bg-accent/10 border-accent/20" };
    if (task.priority === "Critical") return { icon: AlertTriangle, label: "Critical", color: "text-red-500 bg-red-500/10 border-red-500/20" };
    return null;
  };

  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (tab === "All") return t.status !== "Archived";
    if (tab === "Pending") return t.status === "To Do";
    if (tab === "In Progress") return t.status === "In Progress" || t.status === "Review";
    if (tab === "Completed") return t.status === "Completed";
    if (tab === "Archived") return t.status === "Archived";
    return true;
  });

  const columns: TaskStatus[] = ["To Do", "In Progress", "Review", "Completed"];

  const renderTaskCard = (t: Task) => {
    const aiBadge = getAiRecommendation(t);
    return (
      <div 
        key={t.id}
        draggable
        onDragStart={(e) => handleDragStart(e, t.id)}
        className="glass rounded-xl p-4 cursor-grab active:cursor-grabbing border border-white/5 hover:border-primary/50 transition-colors animate-fade-up relative"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={() => updateTask(t.id, { status: t.status === "Completed" ? "To Do" : "Completed" })} className="mt-0.5 text-muted-foreground hover:text-primary transition-colors">
              {t.status === "Completed" ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
            </button>
            <h4 className={`font-medium pr-6 ${t.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</h4>
          </div>
          
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }} className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
            {openMenuId === t.id && (
              <div className="absolute right-0 top-5 w-36 glass border border-white/10 rounded-xl shadow-elegant z-10 py-1 overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); openEditTask(t); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button onClick={(e) => { 
                  e.stopPropagation(); 
                  addTask({ title: `${t.title} (Copy)`, description: t.description, priority: t.priority, category: t.category, tags: t.tags, dueDate: t.dueDate }); 
                  setOpenMenuId(null); 
                }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                  <Copy className="h-3 w-3" /> Duplicate
                </button>
                {t.status === "Archived" ? (
                  <button onClick={(e) => { e.stopPropagation(); updateTask(t.id, { status: "To Do" }); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                    <RotateCcw className="h-3 w-3" /> Restore
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); updateTask(t.id, { status: "Archived" }); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                    <Archive className="h-3 w-3" /> Archive
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); deleteTask(t.id); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {t.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2 pl-7">{t.description}</p>}
        <div className="pl-7 flex flex-wrap items-center gap-2">
          {aiBadge && (
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${aiBadge.color}`}>
              <aiBadge.icon className="h-3 w-3" /> {aiBadge.label}
            </div>
          )}
          <div className={`text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 ${t.priority === "High" || t.priority === "Critical" ? "text-red-400" : t.priority === "Medium" ? "text-amber-400" : "text-blue-400"}`}>
            {t.priority}
          </div>
          {t.dueDate && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/10">
              <CalIcon className="h-3 w-3" /> {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-up h-full flex flex-col" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Tasks Workspace</h2>
          <p className="text-muted-foreground mt-1">Manage your priorities and workflow.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="h-10 pl-9 pr-4 rounded-xl glass border border-white/10 text-sm outline-none focus:border-primary w-40 md:w-64 transition-all"
            />
          </div>
          <div className="glass flex items-center p-1 rounded-xl border border-white/10">
            <button onClick={() => setViewMode("kanban")} className={`p-2 rounded-lg transition-colors ${viewMode === "kanban" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <button onClick={openNewTask} className="gradient-primary h-10 px-4 rounded-xl text-primary-foreground font-semibold flex items-center gap-2 shadow-glow hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6">
        {["All", "Pending", "In Progress", "Completed", "Archived"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all ${tab === t ? "bg-white/10 font-semibold border border-white/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {viewMode === "kanban" && tab === "All" && !searchQuery ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {columns.map(col => (
            <div 
              key={col} 
              className="flex-shrink-0 w-[85vw] sm:w-80 flex flex-col glass rounded-2xl p-4 border border-white/5 bg-white/[0.02]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  {col} <span className="text-xs py-0.5 px-2 bg-white/10 rounded-full">{tasks.filter(t => t.status === col).length}</span>
                </h3>
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
                {tasks.filter(t => t.status === col).map(renderTaskCard)}
                {tasks.filter(t => t.status === col).length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground glass rounded-2xl border border-white/5">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map(renderTaskCard)
          )}
        </div>
      )}

      {isTaskFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setIsTaskFormOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl shadow-elegant w-full max-w-lg p-5 sm:p-6 border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">{editingTaskId ? "Edit Task" : "New Task"}</h3>
              <button onClick={() => setIsTaskFormOpen(false)} className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Title</label>
                <input required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="input w-full" placeholder="What needs to be done?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="input w-full min-h-[80px]" placeholder="Additional details..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium mb-1 text-muted-foreground">
                    Priority
                    <button 
                      type="button" 
                      onClick={handleAiTriage}
                      disabled={isAiTriaging || !taskForm.title}
                      className="text-xs flex items-center gap-1 text-accent hover:text-accent/80 disabled:opacity-50 transition-opacity"
                    >
                      {isAiTriaging ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Triage
                    </button>
                  </label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as Priority})} className="input w-full appearance-none bg-transparent">
                    <option value="Low" className="bg-background text-foreground">Low</option>
                    <option value="Medium" className="bg-background text-foreground">Medium</option>
                    <option value="High" className="bg-background text-foreground">High</option>
                    <option value="Critical" className="bg-background text-foreground">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Category</label>
                  <input value={taskForm.category} onChange={e => setTaskForm({...taskForm, category: e.target.value})} className="input w-full" placeholder="e.g. Work, Personal" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="input w-full" />
              </div>
              <button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11 rounded-xl shadow-glow hover:scale-[1.02] transition-transform mt-2">
                {editingTaskId ? "Save Changes" : "Create Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
