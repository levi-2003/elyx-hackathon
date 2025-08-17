"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Target, Activity, Heart, Brain } from 'lucide-react';

interface ProgressAnalysisProps {
  weekNumber?: number;
}

export function ProgressAnalysis({ weekNumber }: ProgressAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rag?type=progress');
        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (error) {
        console.error('Error fetching progress analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Progress Analysis...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
          <CardDescription>
            Unable to generate progress analysis at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of member's progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {analysis}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
