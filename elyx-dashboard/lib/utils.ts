import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function getMonthName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
}

export function parseConversationLog(logText: string) {
  const weeks = [];
  const weekRegex = /\/new\/ --- WEEK (\d+) \((\d{2}\/\d{2}\/\d{2})\) ---/g;
  let match;
  
  while ((match = weekRegex.exec(logText)) !== null) {
    const weekNumber = parseInt(match[1]);
    const dateStr = match[2];
    const startIndex = match.index;
    
    // Find the next week or end of file
    const nextWeekMatch = /\/new\/ --- WEEK \d+ \(\d{2}\/\d{2}\/\d{2}\) ---/g;
    nextWeekMatch.lastIndex = startIndex + match[0].length;
    const nextMatch = nextWeekMatch.exec(logText);
    const endIndex = nextMatch ? nextMatch.index : logText.length;
    
    const weekContent = logText.substring(startIndex + match[0].length, endIndex).trim();
    
    weeks.push({
      weekNumber,
      date: dateStr,
      content: weekContent,
      messages: parseMessages(weekContent)
    });
  }
  
  return weeks;
}

function parseMessages(weekContent: string) {
  const messages = [];
  const messageRegex = /\[(\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M)\] ([^:]+): (.+?)(?=\[\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M\]|$)/g;
  let match;
  
  while ((match = messageRegex.exec(weekContent)) !== null) {
    messages.push({
      timestamp: match[1],
      sender: match[2].trim(),
      content: match[3].trim()
    });
  }
  
  return messages;
}
