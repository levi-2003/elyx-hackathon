"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MemberProfile } from '../components/dashboard/member-profile';
import { DecisionTimeline } from '../components/dashboard/decision-timeline';
import { WeekSelector } from '../components/dashboard/week-selector';
import { ProgressAnalysis } from '../components/dashboard/progress-analysis';
import { Activity, Target, TrendingUp, Users, Clock, Heart } from 'lucide-react';

export default function Dashboard() {
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);

  const handleWeekChange = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Elyx Health Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Member Journey Analytics
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weeks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Micro-Workouts</div>
              <p className="text-xs text-muted-foreground">
                Current focus area
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adherence Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Goals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Active goals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Week Selector */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <WeekSelector selectedWeek={selectedWeek} onWeekChange={handleWeekChange} />
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Member Profile</TabsTrigger>
                <TabsTrigger value="decisions">Decisions</TabsTrigger>
                <TabsTrigger value="progress">Progress Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                      <CardDescription>
                        Member's current health status and plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MemberProfile weekNumber={selectedWeek} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Decisions</CardTitle>
                      <CardDescription>
                        Key decisions made in the current period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DecisionTimeline weekNumber={selectedWeek} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Member Profile</CardTitle>
                    <CardDescription>
                      Comprehensive view of member's health profile and current status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemberProfile weekNumber={selectedWeek} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decisions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Decision Timeline</CardTitle>
                    <CardDescription>
                      Track all key decisions made throughout the member's journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DecisionTimeline weekNumber={selectedWeek} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Analysis</CardTitle>
                    <CardDescription>
                      AI-powered analysis of member's progress and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressAnalysis weekNumber={selectedWeek} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
