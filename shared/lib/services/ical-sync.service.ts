import { db } from "@/database/db";
import { externalGoogleCalendarSyncEvents, boatGoogleCalendars } from "@/database/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Simple iCal event interface
export interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: Date;
  dtend: Date;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
}

export class ICalSyncService {
  /**
   * Fetch and parse iCal data from URL
   */
  async fetchICalEvents(icalUrl: string): Promise<ICalEvent[]> {
    try {
      const response = await fetch(icalUrl, {
        headers: {
          'User-Agent': 'Kings-Of-The-Sea-Calendar-Sync/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch iCal: ${response.status} ${response.statusText}`);
      }

      const icalData = await response.text();
      return this.parseICalData(icalData);
    } catch (error) {
      console.error('Error fetching iCal:', error);
      throw error;
    }
  }

  /**
   * Parse iCal text data into events
   */
  private parseICalData(icalData: string): ICalEvent[] {
    const events: ICalEvent[] = [];
    const lines = icalData.split('\n').map(line => line.trim());
    
    let currentEvent: Partial<ICalEvent> | null = null;
    
    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        // Validate and add complete event
        if (currentEvent.uid && currentEvent.dtstart && currentEvent.dtend) {
          events.push({
            uid: currentEvent.uid,
            summary: currentEvent.summary || 'Blocked',
            dtstart: currentEvent.dtstart,
            dtend: currentEvent.dtend,
            status: currentEvent.status || 'CONFIRMED'
          });
        }
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':');
        
        switch (key) {
          case 'UID':
            currentEvent.uid = value;
            break;
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
          case 'DTSTART':
          case 'DTSTART;VALUE=DATE':
            currentEvent.dtstart = this.parseICalDate(value);
            break;
          case 'DTEND':
          case 'DTEND;VALUE=DATE':
            currentEvent.dtend = this.parseICalDate(value);
            break;
          case 'STATUS':
            currentEvent.status = value as 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
            break;
        }
      }
    }
    
    return events;
  }

  /**
   * Parse iCal date format to JavaScript Date
   */
  private parseICalDate(dateStr: string): Date {
    // Handle different iCal date formats
    if (dateStr.includes('T')) {
      // DateTime format: 20250915T140000Z
      const cleanDate = dateStr.replace(/[TZ]/g, '');
      const year = parseInt(cleanDate.slice(0, 4));
      const month = parseInt(cleanDate.slice(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(cleanDate.slice(6, 8));
      const hour = parseInt(cleanDate.slice(8, 10)) || 0;
      const minute = parseInt(cleanDate.slice(10, 12)) || 0;
      const second = parseInt(cleanDate.slice(12, 14)) || 0;
      
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      // Date only format: 20250915
      const year = parseInt(dateStr.slice(0, 4));
      const month = parseInt(dateStr.slice(4, 6)) - 1;
      const day = parseInt(dateStr.slice(6, 8));
      
      return new Date(year, month, day);
    }
  }

  /**
   * Sync a specific boat calendar
   */
  async syncBoatCalendar(boatCalendarId: string): Promise<{ success: boolean; message: string; eventsProcessed: number }> {
    try {
      // Get boat calendar config
      const [boatCalendar] = await db
        .select()
        .from(boatGoogleCalendars)
        .where(eq(boatGoogleCalendars.id, boatCalendarId))
        .limit(1);

      if (!boatCalendar) {
        return { success: false, message: 'Boat calendar not found', eventsProcessed: 0 };
      }

      if (!boatCalendar.syncEnabled) {
        return { success: false, message: 'Sync disabled for this calendar', eventsProcessed: 0 };
      }

      // Fetch events from iCal URL
      const events = await this.fetchICalEvents(boatCalendar.calendarId);
      
      // Filter to only future/current events (last 30 days to 1 year ahead)
      const now = new Date();
      const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const future1Year = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      const relevantEvents = events.filter(event => 
        event.dtend >= past30Days && 
        event.dtstart <= future1Year &&
        event.status !== 'CANCELLED'
      );

      // Remove old external events for this specific calendar
      await db
        .delete(externalGoogleCalendarSyncEvents)
        .where(
          and(
            eq(externalGoogleCalendarSyncEvents.boatId, boatCalendar.boatId),
            eq(externalGoogleCalendarSyncEvents.source, 'GOOGLE'),
            eq(externalGoogleCalendarSyncEvents.boatCalendarId, boatCalendar.id)
          )
        );

      // Insert new events
      if (relevantEvents.length > 0) {
        const availabilityRecords = relevantEvents.map(event => ({
          boatId: boatCalendar.boatId,
          boatCalendarId: boatCalendar.id,
          eventId: event.uid,
          startTime: event.dtstart,
          endTime: event.dtend,
          isAvailable: false, // External events block availability
          source: 'GOOGLE' as const,
          lastSyncedAt: new Date()
        }));

        await db.insert(externalGoogleCalendarSyncEvents).values(availabilityRecords);
      }

      // Update sync status
      await db
        .update(boatGoogleCalendars)
        .set({
          lastSyncAt: new Date(),
          lastSyncStatus: 'SUCCESS',
          updatedAt: new Date()
        })
        .where(eq(boatGoogleCalendars.id, boatCalendarId));

      return { 
        success: true, 
        message: `Successfully synced ${relevantEvents.length} events`, 
        eventsProcessed: relevantEvents.length 
      };

    } catch (error) {
      console.error('Error syncing boat calendar:', error);
      
      // Update sync status to failed
      await db
        .update(boatGoogleCalendars)
        .set({
          lastSyncAt: new Date(),
          lastSyncStatus: 'FAILED',
          updatedAt: new Date()
        })
        .where(eq(boatGoogleCalendars.id, boatCalendarId));

      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error', 
        eventsProcessed: 0 
      };
    }
  }

  /**
   * Sync all enabled boat calendars
   */
  async syncAllBoatCalendars(): Promise<{ totalCalendars: number; successCount: number; failedCount: number }> {
    // Get all enabled calendars
    const enabledCalendars = await db
      .select()
      .from(boatGoogleCalendars)
      .where(eq(boatGoogleCalendars.syncEnabled, true));

    let successCount = 0;
    let failedCount = 0;

    for (const calendar of enabledCalendars) {
      const result = await this.syncBoatCalendar(calendar.id);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    return {
      totalCalendars: enabledCalendars.length,
      successCount,
      failedCount
    };
  }
}

// Export singleton instance
export const icalSyncService = new ICalSyncService();
