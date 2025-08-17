# Elyx Health Dashboard

A comprehensive RAG-based web application for tracking member health journeys, exercise plans, medications, and decision-making processes. Built with Next.js, shadcn/ui, and powered by Gemini AI.

## Features

- **Member Profile Tracking**: View current health plans, medications, exercise routines, and goals
- **Decision Timeline**: Track key decisions made throughout the member's journey with reasoning and outcomes
- **Week-by-Week Analysis**: Navigate through different weeks to see progress over time
- **Progress Analytics**: AI-powered analysis of member progress and recommendations
- **RAG Integration**: Uses Gemini AI to extract insights from conversation logs
- **Responsive Design**: Modern UI built with shadcn/ui components

## Prerequisites

- Node.js 18+ 
- Python 3.8+ (for data processing)
- Gemini AI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elyx-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Install Python dependencies** (optional, for data processing)
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Starting the Dashboard

1. **Development mode**
   ```bash
   npm run dev
   ```

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

3. **Access the dashboard**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Data Processing

The dashboard includes a Python script for processing conversation logs:

```bash
# Process the conversation log and generate statistics
python elyx_data_processor.py "full_conversation_log_langgraph_detailed (2).txt" --stats

# Analyze a specific week
python elyx_data_processor.py "full_conversation_log_langgraph_detailed (2).txt" --week 15

# Export analysis to JSON
python elyx_data_processor.py "full_conversation_log_langgraph_detailed (2).txt" --output analysis.json
```

## Dashboard Components

### 1. Overview Tab
- Current member status
- Recent decisions
- Key metrics and progress indicators

### 2. Member Profile Tab
- Comprehensive health profile
- Current medications and exercise plans
- Health goals and challenges
- Progress tracking with adherence rates

### 3. Decisions Tab
- Timeline of key decisions
- Reasoning and factors for each decision
- Expected and actual outcomes
- Decision context and impact

### 4. Progress Analysis Tab
- AI-generated analysis of member progress
- Recommendations for continued improvement
- Risk factors and success metrics

### 5. Week Navigation
- Navigate between different weeks
- View week-specific data and insights
- Track progress over time

## API Endpoints

The dashboard includes several API endpoints for data retrieval:

- `GET /api/rag?type=profile&week={weekNumber}` - Get member profile
- `GET /api/rag?type=decisions&week={weekNumber}` - Get decisions for a week
- `GET /api/rag?type=summary&week={weekNumber}` - Get week summary
- `GET /api/rag?type=progress` - Get overall progress analysis
- `GET /api/rag?type=weeks` - Get all available weeks

## Data Structure

The application processes conversation logs with the following structure:

```
/new/ --- WEEK 1 (11/08/25) ---
[timestamp] Sender: Message content
[timestamp] Sender: Message content
...
```

## Configuration

### Gemini AI Setup

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file
3. The RAG service will automatically use this key for processing

### Customization

- **Styling**: Modify `tailwind.config.ts` for theme customization
- **Components**: All UI components are in `components/ui/`
- **Dashboard Components**: Custom dashboard components in `components/dashboard/`
- **API Logic**: RAG service logic in `lib/rag-service.ts`

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Gemini API key is correctly set in `.env.local`
2. **File Not Found**: Make sure the conversation log file is in the correct location
3. **Build Errors**: Clear `.next` folder and reinstall dependencies

### Performance

- The RAG service caches conversation data for better performance
- Large conversation logs are processed incrementally
- API responses are optimized for dashboard consumption

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
