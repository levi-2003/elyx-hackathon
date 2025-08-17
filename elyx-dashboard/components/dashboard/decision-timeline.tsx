"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface DecisionContext {
  decision: string;
  date: string;
  reasoning: string;
  factors: string[];
  outcome: string;
}

interface DecisionTimelineProps {
  weekNumber?: number;
}

export function DecisionTimeline({ weekNumber }: DecisionTimelineProps) {
  const [decisions, setDecisions] = useState<DecisionContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rag?type=decisions${weekNumber ? `&week=${weekNumber}` : ''}`);
        const data = await response.json();
        setDecisions(data);
      } catch (error) {
        console.error('Error fetching decisions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, [weekNumber]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Decisions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!decisions || decisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Decisions Found</CardTitle>
          <CardDescription>
            No key decisions have been identified for this period.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Key Decisions Timeline
        </CardTitle>
        <CardDescription>
          Important decisions made regarding the member's health plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {decisions.map((decision, index) => (
            <div key={index} className="relative">
              {/* Timeline line */}
              {index < decisions.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Decision content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{decision.decision}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {decision.date}
                      </div>
                    </div>
                    <Badge variant="outline">Decision</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Reasoning</h5>
                      <p className="text-sm">{decision.reasoning}</p>
                    </div>

                    {decision.factors.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-muted-foreground mb-2">Key Factors</h5>
                        <div className="flex flex-wrap gap-2">
                          {decision.factors.map((factor, factorIndex) => (
                            <Badge key={factorIndex} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Outcome</h5>
                      <p className="text-sm">{decision.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
