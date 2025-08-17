#!/usr/bin/env python3
"""
Elyx Data Processor
Processes conversation logs and extracts insights for the dashboard
"""

import re
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import argparse

class ElyxDataProcessor:
    def __init__(self, log_file_path: str):
        self.log_file_path = log_file_path
        self.conversation_data = self.load_conversation_log()
        self.weeks = self.parse_weeks()
        
    def load_conversation_log(self) -> str:
        """Load the conversation log file"""
        try:
            with open(self.log_file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            print(f"Error: Log file not found at {self.log_file_path}")
            return ""
        except Exception as e:
            print(f"Error reading log file: {e}")
            return ""
    
    def parse_weeks(self) -> List[Dict[str, Any]]:
        """Parse the conversation log into weeks"""
        weeks = []
        week_pattern = r'/new/ --- WEEK (\d+) \((\d{2}/\d{2}/\d{2})\) ---'
        
        matches = list(re.finditer(week_pattern, self.conversation_data))
        
        for i, match in enumerate(matches):
            week_number = int(match.group(1))
            date_str = match.group(2)
            start_pos = match.end()
            
            # Find the end of this week's content
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(self.conversation_data)
            
            week_content = self.conversation_data[start_pos:end_pos].strip()
            messages = self.parse_messages(week_content)
            
            weeks.append({
                'week_number': week_number,
                'date': date_str,
                'content': week_content,
                'messages': messages,
                'message_count': len(messages),
                'participants': self.extract_participants(messages)
            })
        
        return weeks
    
    def parse_messages(self, week_content: str) -> List[Dict[str, str]]:
        """Parse messages from week content"""
        messages = []
        message_pattern = r'\[(\d{2}/\d{2}/\d{2}, \d{2}:\d{2} [AP]M)\] ([^:]+): (.+?)(?=\[\d{2}/\d{2}/\d{2}, \d{2}:\d{2} [AP]M\]|$)'
        
        for match in re.finditer(message_pattern, week_content, re.DOTALL):
            messages.append({
                'timestamp': match.group(1),
                'sender': match.group(2).strip(),
                'content': match.group(3).strip()
            })
        
        return messages
    
    def extract_participants(self, messages: List[Dict[str, str]]) -> List[str]:
        """Extract unique participants from messages"""
        participants = set()
        for message in messages:
            participants.add(message['sender'])
        return list(participants)
    
    def analyze_member_profile(self, week_number: Optional[int] = None) -> Dict[str, Any]:
        """Analyze member profile for a specific week or overall"""
        if week_number:
            week_data = next((w for w in self.weeks if w['week_number'] == week_number), None)
            if not week_data:
                return self.get_default_profile()
            content = week_data['content']
        else:
            content = self.conversation_data
        
        # Extract key information using regex patterns
        profile = self.get_default_profile()
        
        # Extract member name
        name_match = re.search(r'Rohan Patel', content)
        if name_match:
            profile['name'] = 'Rohan Patel'
        
        # Extract exercise plan mentions
        exercise_patterns = [
            r'exercise plan[^.]*',
            r'workout[^.]*',
            r'micro-workout[^.]*',
            r'fitness[^.]*'
        ]
        
        exercise_mentions = []
        for pattern in exercise_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            exercise_mentions.extend(matches)
        
        if exercise_mentions:
            profile['exercisePlan'] = exercise_mentions[0][:200] + "..."
        
        # Extract challenges
        challenge_patterns = [
            r'travel schedule[^.]*',
            r'back-to-back meetings[^.]*',
            r'time constraints[^.]*',
            r'adherence challenges[^.]*'
        ]
        
        challenges = []
        for pattern in challenge_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            challenges.extend(matches)
        
        profile['challenges'] = challenges[:5]  # Limit to 5 challenges
        
        # Estimate adherence based on positive/negative language
        positive_words = ['successful', 'improved', 'better', 'achieved', 'completed']
        negative_words = ['challenging', 'difficult', 'missed', 'failed', 'struggled']
        
        positive_count = sum(content.lower().count(word) for word in positive_words)
        negative_count = sum(content.lower().count(word) for word in negative_words)
        
        if positive_count + negative_count > 0:
            adherence = min(100, max(0, (positive_count / (positive_count + negative_count)) * 100))
            profile['progress']['adherence'] = round(adherence)
        
        return profile
    
    def extract_decisions(self, week_number: Optional[int] = None) -> List[Dict[str, Any]]:
        """Extract key decisions from the conversation"""
        if week_number:
            week_data = next((w for w in self.weeks if w['week_number'] == week_number), None)
            if not week_data:
                return []
            content = week_data['content']
        else:
            content = self.conversation_data
        
        decisions = []
        
        # Look for decision-related patterns
        decision_patterns = [
            r'(?:decided|chose|selected|implemented|started|updated|modified)[^.]*',
            r'(?:plan|strategy|approach|routine)[^.]*',
            r'(?:recommendation|suggestion|advice)[^.]*'
        ]
        
        for pattern in decision_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                # Extract date from nearby context
                date_match = re.search(r'\d{2}/\d{2}/\d{2}', match)
                date = date_match.group() if date_match else "Unknown"
                
                decisions.append({
                    'decision': match.strip(),
                    'date': date,
                    'reasoning': 'Extracted from conversation context',
                    'factors': ['Schedule constraints', 'Health goals', 'Travel demands'],
                    'outcome': 'To be determined'
                })
        
        return decisions[:10]  # Limit to 10 decisions
    
    def generate_week_summary(self, week_number: int) -> str:
        """Generate a summary for a specific week"""
        week_data = next((w for w in self.weeks if w['week_number'] == week_number), None)
        if not week_data:
            return f"Week {week_number} not found"
        
        summary = f"Week {week_number} Summary ({week_data['date']})\n\n"
        summary += f"Total Messages: {week_data['message_count']}\n"
        summary += f"Participants: {', '.join(week_data['participants'])}\n\n"
        
        # Extract key themes
        content = week_data['content'].lower()
        
        themes = []
        if 'exercise' in content or 'workout' in content:
            themes.append("Exercise plan discussions")
        if 'travel' in content:
            themes.append("Travel schedule challenges")
        if 'adherence' in content:
            themes.append("Plan adherence")
        if 'baseline' in content or 'diagnostic' in content:
            themes.append("Health assessments")
        
        if themes:
            summary += "Key Themes:\n"
            for theme in themes:
                summary += f"- {theme}\n"
            summary += "\n"
        
        # Extract a sample message
        if week_data['messages']:
            sample_msg = week_data['messages'][0]
            summary += f"Sample Message ({sample_msg['sender']}):\n"
            summary += f"{sample_msg['content'][:200]}...\n"
        
        return summary
    
    def get_default_profile(self) -> Dict[str, Any]:
        """Get default profile structure"""
        return {
            'name': 'Unknown',
            'currentPlan': 'No plan available',
            'medications': [],
            'exercisePlan': 'No exercise plan available',
            'healthGoals': ['Improve health', 'Increase fitness'],
            'challenges': [],
            'progress': {
                'adherence': 0,
                'improvements': [],
                'setbacks': []
            }
        }
    
    def export_analysis(self, output_file: str):
        """Export analysis results to JSON"""
        analysis = {
            'total_weeks': len(self.weeks),
            'weeks': self.weeks,
            'overall_profile': self.analyze_member_profile(),
            'overall_decisions': self.extract_decisions(),
            'generated_at': datetime.now().isoformat()
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        
        print(f"Analysis exported to {output_file}")
    
    def print_statistics(self):
        """Print basic statistics about the conversation data"""
        print(f"Elyx Conversation Analysis")
        print(f"=" * 50)
        print(f"Total Weeks: {len(self.weeks)}")
        print(f"Total Messages: {sum(w['message_count'] for w in self.weeks)}")
        
        if self.weeks:
            print(f"Date Range: {self.weeks[0]['date']} to {self.weeks[-1]['date']}")
            
            # Most active weeks
            active_weeks = sorted(self.weeks, key=lambda x: x['message_count'], reverse=True)[:3]
            print(f"\nMost Active Weeks:")
            for week in active_weeks:
                print(f"  Week {week['week_number']}: {week['message_count']} messages")
            
            # Participants
            all_participants = set()
            for week in self.weeks:
                all_participants.update(week['participants'])
            print(f"\nParticipants: {', '.join(all_participants)}")

def main():
    parser = argparse.ArgumentParser(description='Process Elyx conversation data')
    parser.add_argument('log_file', help='Path to the conversation log file')
    parser.add_argument('--output', '-o', help='Output file for analysis results')
    parser.add_argument('--week', '-w', type=int, help='Analyze specific week')
    parser.add_argument('--stats', '-s', action='store_true', help='Print statistics')
    
    args = parser.parse_args()
    
    processor = ElyxDataProcessor(args.log_file)
    
    if args.stats:
        processor.print_statistics()
    
    if args.week:
        profile = processor.analyze_member_profile(args.week)
        decisions = processor.extract_decisions(args.week)
        summary = processor.generate_week_summary(args.week)
        
        print(f"\nWeek {args.week} Analysis:")
        print(f"Profile: {json.dumps(profile, indent=2)}")
        print(f"Decisions: {json.dumps(decisions, indent=2)}")
        print(f"Summary:\n{summary}")
    
    if args.output:
        processor.export_analysis(args.output)

if __name__ == "__main__":
    main()
