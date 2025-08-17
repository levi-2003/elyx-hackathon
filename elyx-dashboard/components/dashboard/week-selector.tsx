"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Week {
  weekNumber: number;
  date: string;
}

interface WeekSelectorProps {
  selectedWeek?: number;
  onWeekChange: (weekNumber: number) => void;
}

export function WeekSelector({ selectedWeek, onWeekChange }: WeekSelectorProps) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/rag?type=weeks');
        const data = await response.json();
        setWeeks(data);
      } catch (error) {
        console.error('Error fetching weeks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  const currentWeekIndex = weeks.findIndex(w => w.weekNumber === selectedWeek);
  const currentWeek = weeks[currentWeekIndex];

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      onWeekChange(weeks[currentWeekIndex - 1].weekNumber);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      onWeekChange(weeks[currentWeekIndex + 1].weekNumber);
    }
  };

  const goToCurrentWeek = () => {
    if (weeks.length > 0) {
      onWeekChange(weeks[weeks.length - 1].weekNumber);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Weeks...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Week Navigation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={currentWeekIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-center">
            <div className="text-lg font-semibold">
              {currentWeek ? `Week ${currentWeek.weekNumber}` : 'Select Week'}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentWeek ? currentWeek.date : ''}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            disabled={currentWeekIndex >= weeks.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={goToCurrentWeek}
            className="w-full"
          >
            Go to Latest Week
          </Button>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">All Weeks:</div>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {weeks.map((week) => (
              <Button
                key={week.weekNumber}
                variant={selectedWeek === week.weekNumber ? "default" : "outline"}
                size="sm"
                onClick={() => onWeekChange(week.weekNumber)}
                className="text-xs"
              >
                Week {week.weekNumber}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
