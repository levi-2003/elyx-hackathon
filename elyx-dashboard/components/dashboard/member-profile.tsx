"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { User, Target, Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface MemberProfile {
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

interface MemberProfileProps {
  weekNumber?: number;
}

export function MemberProfile({ weekNumber }: MemberProfileProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rag?type=profile${weekNumber ? `&week=${weekNumber}` : ''}`);
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [weekNumber]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Profile</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Basic Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Member Profile</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.name}</div>
          <p className="text-xs text-muted-foreground">
            Current Plan: {profile.currentPlan}
          </p>
        </CardContent>
      </Card>

      {/* Adherence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.progress.adherence}%</div>
          <Progress value={profile.progress.adherence} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Plan adherence this period
          </p>
        </CardContent>
      </Card>

      {/* Exercise Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exercise Plan</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm">{profile.exercisePlan}</p>
        </CardContent>
      </Card>

      {/* Health Goals */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Health Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.healthGoals.map((goal, index) => (
              <Badge key={index} variant="secondary">
                {goal}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.medications.length > 0 ? (
            <ul className="space-y-2">
              {profile.medications.map((medication, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No medications listed</p>
          )}
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Current Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.challenges.length > 0 ? (
            <ul className="space-y-2">
              {profile.challenges.map((challenge, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {challenge}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No current challenges</p>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Improvements</h4>
              <ul className="space-y-1">
                {profile.progress.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-orange-600 mb-2">Setbacks</h4>
              <ul className="space-y-1">
                {profile.progress.setbacks.map((setback, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {setback}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
