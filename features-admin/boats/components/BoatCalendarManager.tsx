"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar, Plus, RefreshCw, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface BoatCalendar {
  id: string;
  calendarName: string;
  calendarId: string; // iCal URL
  ownerType: 'ADMIN' | 'OWNER';
  syncEnabled: boolean;
  lastSyncAt?: Date;
  lastSyncStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
}

interface BoatCalendarManagerProps {
  boatId: string;
  boatName: string;
  calendars: BoatCalendar[];
  onCalendarsChange: (calendars: BoatCalendar[]) => void;
}

export default function BoatCalendarManager({ 
  boatId, 
  boatName, 
  calendars, 
  onCalendarsChange 
}: BoatCalendarManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [syncingCalendars, setSyncingCalendars] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Form state for adding new calendar
  const [newCalendar, setNewCalendar] = useState({
    name: '',
    icalUrl: '',
    ownerType: 'OWNER' as 'ADMIN' | 'OWNER'
  });

  const handleAddCalendar = async () => {
    if (!newCalendar.name || !newCalendar.icalUrl) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/boats/${boatId}/calendars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calendarName: newCalendar.name,
          calendarId: newCalendar.icalUrl,
          ownerType: newCalendar.ownerType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create calendar');
      }

      const createdCalendar = await response.json();
      
      onCalendarsChange([...calendars, createdCalendar]);
      setNewCalendar({ name: '', icalUrl: '', ownerType: 'OWNER' });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Calendar Added",
        description: "External calendar has been added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add calendar",
        variant: "destructive"
      });
    }
  };

  const handleSyncCalendar = async (calendarId: string) => {
    setSyncingCalendars(prev => new Set(prev).add(calendarId));
    
    try {
      const response = await fetch(`/api/admin/calendar-sync?boatCalendarId=${calendarId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update calendar status
        const updatedCalendars = calendars.map(cal => 
          cal.id === calendarId 
            ? { ...cal, lastSyncAt: new Date(), lastSyncStatus: 'SUCCESS' as const }
            : cal
        );
        onCalendarsChange(updatedCalendars);
        
        toast({
          title: "Sync Successful",
          description: `${result.eventsProcessed} events synced`
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setSyncingCalendars(prev => {
        const newSet = new Set(prev);
        newSet.delete(calendarId);
        return newSet;
      });
    }
  };

  const handleRemoveCalendar = (calendarId: string) => {
    onCalendarsChange(calendars.filter(cal => cal.id !== calendarId));
    toast({
      title: "Calendar Removed",
      description: "External calendar has been removed"
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Synced</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            External Calendars - {boatName}
          </CardTitle>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Calendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add External Calendar</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calendarName">Calendar Name</Label>
                  <Input
                    id="calendarName"
                    placeholder="e.g., Captain John's Google Calendar"
                    value={newCalendar.name}
                    onChange={(e) => setNewCalendar(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="icalUrl">iCal URL</Label>
                  <Input
                    id="icalUrl"
                    placeholder="https://calendar.google.com/calendar/ical/..."
                    value={newCalendar.icalUrl}
                    onChange={(e) => setNewCalendar(prev => ({ ...prev, icalUrl: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get this from Google Calendar → Settings → Share → Secret address in iCal format
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="ownerType">Owner Type</Label>
                  <Select 
                    value={newCalendar.ownerType} 
                    onValueChange={(value: 'ADMIN' | 'OWNER') => 
                      setNewCalendar(prev => ({ ...prev, ownerType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Boat Owner</SelectItem>
                      <SelectItem value="ADMIN">Admin Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddCalendar} className="flex-1">
                    Add Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {calendars.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No external calendars connected</p>
            <p className="text-sm">Add boat owner's Google Calendar to sync availability</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calendars.map((calendar) => (
              <div key={calendar.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{calendar.calendarName}</h3>
                      {getStatusBadge(calendar.lastSyncStatus)}
                      <Badge variant="outline" className="text-xs">
                        {calendar.ownerType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate max-w-md">{calendar.calendarId}</span>
                    </div>
                    
                    {calendar.lastSyncAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        {getStatusIcon(calendar.lastSyncStatus)}
                        <span>
                          Last synced: {calendar.lastSyncAt.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSyncCalendar(calendar.id)}
                      disabled={syncingCalendars.has(calendar.id)}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${
                        syncingCalendars.has(calendar.id) ? 'animate-spin' : ''
                      }`} />
                      Sync
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveCalendar(calendar.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
