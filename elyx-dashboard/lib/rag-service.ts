import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ConversationWeek {
  weekNumber: number;
  date: string;
  content: string;
  messages: Array<{
    timestamp: string;
    sender: string;
    content: string;
  }>;
}

export interface MemberProfile {
  name: string;
  currentPlan: string;
  medications: string[];
  exercisePlan: string;
  healthGoals: string[];
  challenges: string[];
  progress: {
    adherence: number;
    improvements: string[];
    setbacks: string[];
  };
}

export interface DecisionContext {
  decision: string;
  date: string;
  reasoning: string;
  factors: string[];
  outcome: string;
}

export class RAGService {
  private conversationData: string = "";
  private weeks: ConversationWeek[] = [];

  constructor(conversationLog: string) {
    this.conversationData = conversationLog;
    this.weeks = this.parseConversationLog(conversationLog);
  }

  private parseConversationLog(logText: string): ConversationWeek[] {
    const weeks: ConversationWeek[] = [];
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
        messages: this.parseMessages(weekContent)
      });
    }
    
    return weeks;
  }

  private parseMessages(weekContent: string) {
    const messages = [];
    // Split content by message pattern and process each match
    const messagePattern = /\[(\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M)\] ([^:]+): (.+?)(?=\[\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [AP]M\]|$)/g;
    let match;
    
    while ((match = messagePattern.exec(weekContent)) !== null) {
      messages.push({
        timestamp: match[1],
        sender: match[2].trim(),
        content: match[3].trim()
      });
    }
    
    return messages;
  }

  async queryMemberProfile(weekNumber?: number): Promise<MemberProfile> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const context = weekNumber 
      ? this.weeks.find(w => w.weekNumber === weekNumber)?.content || this.conversationData
      : this.conversationData;

    const prompt = `
    Based on the following conversation data, analyze and extract the member's profile information:

    ${context}

    Please provide a structured analysis including:
    1. Current health plan and recommendations
    2. Medications being taken
    3. Exercise plan details
    4. Health goals
    5. Current challenges
    6. Progress indicators (adherence, improvements, setbacks)

    Format the response as a JSON object with the following structure:
    {
      "name": "member name",
      "currentPlan": "current health plan",
      "medications": ["medication1", "medication2"],
      "exercisePlan": "exercise plan details",
      "healthGoals": ["goal1", "goal2"],
      "challenges": ["challenge1", "challenge2"],
      "progress": {
        "adherence": 75,
        "improvements": ["improvement1", "improvement2"],
        "setbacks": ["setback1", "setback2"]
      }
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Could not parse response as JSON");
    } catch (error) {
      console.error("Error querying member profile:", error);
      return {
        name: "Unknown",
        currentPlan: "No plan available",
        medications: [],
        exercisePlan: "No exercise plan available",
        healthGoals: [],
        challenges: [],
        progress: {
          adherence: 0,
          improvements: [],
          setbacks: []
        }
      };
    }
  }

  async queryDecisions(weekNumber?: number): Promise<DecisionContext[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const context = weekNumber 
      ? this.weeks.find(w => w.weekNumber === weekNumber)?.content || this.conversationData
      : this.conversationData;

    const prompt = `
    Analyze the following conversation data to identify key decisions made regarding the member's health plan:

    ${context}

    Look for decisions about:
    - Medication changes
    - Exercise plan modifications
    - Diagnostic tests
    - Treatment adjustments
    - Lifestyle recommendations

    For each decision identified, provide:
    1. What the decision was
    2. When it was made
    3. The reasoning behind it
    4. Key factors considered
    5. Expected or actual outcomes

    Format the response as a JSON array of decision objects:
    [
      {
        "decision": "description of decision",
        "date": "date when made",
        "reasoning": "why this decision was made",
        "factors": ["factor1", "factor2"],
        "outcome": "expected or actual outcome"
      }
    ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error("Error querying decisions:", error);
      return [];
    }
  }

  async queryWeekSummary(weekNumber: number): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const week = this.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      return "Week not found";
    }

    const prompt = `
    Provide a comprehensive summary of Week ${weekNumber} from the following conversation data:

    ${week.content}

    Include:
    - Key events and milestones
    - Member's adherence to recommendations
    - Challenges faced
    - Progress made
    - Any decisions or plan changes
    - Recommendations for the following week
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating week summary:", error);
      return "Unable to generate summary";
    }
  }

  async queryProgressAnalysis(): Promise<any> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Analyze the entire conversation data to provide insights on the member's progress over time:

    ${this.conversationData}

    Provide analysis on:
    1. Overall adherence trends
    2. Key milestones achieved
    3. Persistent challenges
    4. Areas of improvement
    5. Recommendations for continued progress
    6. Risk factors or concerns
    7. Success metrics and achievements

    Format as a comprehensive analysis with specific data points and recommendations.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error analyzing progress:", error);
      return "Unable to analyze progress";
    }
  }

  getWeeks(): ConversationWeek[] {
    return this.weeks;
  }

  getWeek(weekNumber: number): ConversationWeek | undefined {
    return this.weeks.find(w => w.weekNumber === weekNumber);
  }
}
