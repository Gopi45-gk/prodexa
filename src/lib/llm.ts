import { createServerFn } from "@tanstack/react-start";

const API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_KEY = process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const generateCompletion = createServerFn({ method: "POST" })
  .validator((messages: ChatMessage[]) => messages)
  .handler(async ({ data: messages }) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-ai/deepseek-r1",
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false
        })
      });

      if (!response.ok) {
        const errTxt = await response.text();
        console.error("LLM Error:", errTxt);
        throw new Error(`LLM Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content as string;
    } catch (error) {
      console.error("Failed to generate completion:", error);
      throw error;
    }
  });

// AI Helper Functions

export async function generateChatResponse(userMessage: string, contextData: any) {
  const systemPrompt = `You are PRODEXA AI, a highly intelligent productivity and coaching assistant. 
You have access to the user's current data context:
${JSON.stringify(contextData, null, 2)}

Provide concise, highly actionable, and encouraging advice. If asked to prioritize, recommend specific tasks from their list. Do not hallucinate tasks. Keep responses professional but friendly.`;

  return generateCompletion({ data: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage }
  ]});
}

export async function generateDailyReport(contextData: any) {
  const prompt = `Based on the following user data, generate a "Daily Productivity Report" that includes:
1. Analysis of completed vs missed tasks today.
2. A brief productivity score assessment based on focus hours and tasks.
3. 2 actionable suggested improvements for tomorrow.
Data: ${JSON.stringify(contextData)}`;

  return generateCompletion({ data: [
    { role: "system", content: "You are the PRODEXA AI Coach." },
    { role: "user", content: prompt }
  ]});
}

export async function generateBurnoutAnalysis(contextData: any) {
  const prompt = `Analyze this workload data for burnout risk:
${JSON.stringify(contextData)}
1. State the Risk Level: "Low Risk", "Medium Risk", or "High Risk".
2. Provide 2-3 sentences of actionable advice to manage workload and improve well-being.
Be empathetic but direct.`;

  return generateCompletion({ data: [
    { role: "system", content: "You are an empathetic productivity and well-being AI coach." },
    { role: "user", content: prompt }
  ]});
}

export async function generateSmartPriority(taskTitle: string, taskDesc: string, dueDate: string) {
  const prompt = `Categorize this task into exactly one of these priorities: "Critical", "Important", "Planned", or "Low Priority".
Respond ONLY with the priority name.
Task: ${taskTitle}
Description: ${taskDesc}
Due: ${dueDate}`;

  const res = await generateCompletion({ data: [
    { role: "system", content: "You are a task triaging AI." },
    { role: "user", content: prompt }
  ]});
  
  const text = res.trim().toLowerCase();
  if (text.includes("critical")) return "Critical";
  if (text.includes("important")) return "High"; // map Important to High
  if (text.includes("planned")) return "Medium"; // map Planned to Medium
  return "Low";
}

export async function generateStudentPlan(contextData: any) {
  const prompt = `You are a Student AI Coach. Analyze the user's assignments and exams data:
${JSON.stringify(contextData)}
Generate:
1. A brief Study Plan.
2. Exam Preparation Strategy.
3. Priority Recommendations for what to tackle first.`;

  return generateCompletion({ data: [
    { role: "system", content: "You are an expert academic advisor and student coach." },
    { role: "user", content: prompt }
  ]});
}

export async function generateCareerRecommendations(contextData: any) {
  const prompt = `You are a Career AI Coach. Analyze the user's career applications and certifications:
${JSON.stringify(contextData)}
Generate:
1. Career Growth Recommendations.
2. Learning Roadmap.
3. Resume Improvement Tips based on missing or present certifications.`;

  return generateCompletion({ data: [
    { role: "system", content: "You are an expert career counselor." },
    { role: "user", content: prompt }
  ]});
}

export async function generateWeeklyReview(contextData: any) {
  const prompt = `You are a Productivity Coach. Generate a Weekly Review based on the user's data:
${JSON.stringify(contextData)}
Include:
1. Wins (Highlight key completions).
2. Missed Deadlines (If any).
3. Focus Statistics Summary.
4. Habit Performance.
5. Goal Progress.
Keep it structured with markdown bullet points.`;

  return generateCompletion({ data: [
    { role: "system", content: "You are an analytical productivity coach." },
    { role: "user", content: prompt }
  ]});
}
