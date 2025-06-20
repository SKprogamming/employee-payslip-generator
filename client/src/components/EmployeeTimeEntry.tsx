import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Clock, Plus, Save, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const timeEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  breakDuration: z.string().default("0"),
  projectCode: z.string().optional(),
  description: z.string().optional(),
});

type TimeEntryData = z.infer<typeof timeEntrySchema>;

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  hoursWorked: number;
  projectCode?: string;
  description?: string;
}

export default function EmployeeTimeEntry() {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  const form = useForm<TimeEntryData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "17:00",
      breakDuration: "60",
      projectCode: "",
      description: "",
    },
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (data: TimeEntryData) => {
      // Calculate hours worked
      const startMinutes = timeToMinutes(data.startTime);
      const endMinutes = timeToMinutes(data.endTime);
      const breakMinutes = parseInt(data.breakDuration) || 0;
      const hoursWorked = (endMinutes - startMinutes - breakMinutes) / 60;

      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        ...data,
        hoursWorked: Math.max(0, hoursWorked),
      };

      // In a real app, this would save to the server
      setTimeEntries(prev => [newEntry, ...prev]);
      return newEntry;
    },
    onSuccess: () => {
      toast({ title: "Time entry added successfully" });
      form.reset({
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "17:00",
        breakDuration: "60",
        projectCode: "",
        description: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive",
      });
    },
  });

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (timeString: string): string => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onSubmit = (data: TimeEntryData) => {
    addTimeEntryMutation.mutate(data);
  };

  const totalHoursThisWeek = timeEntries.reduce((total, entry) => {
    const entryDate = new Date(entry.date);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (entryDate >= weekStart && entryDate <= weekEnd) {
      return total + entry.hoursWorked;
    }
    return total;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Time Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Time Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breakDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="60" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PROJ-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of work performed..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={addTimeEntryMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {addTimeEntryMutation.isPending ? "Adding..." : "Add Time Entry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>This Week's Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{totalHoursThisWeek.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Hours Worked This Week</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No time entries yet.</p>
              <p className="text-sm">Add your first time entry above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </div>
                      {entry.projectCode && (
                        <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {entry.projectCode}
                        </div>
                      )}
                    </div>
                    {entry.description && (
                      <div className="mt-1 text-sm text-gray-600">{entry.description}</div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {entry.hoursWorked.toFixed(1)}h
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}