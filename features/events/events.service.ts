"use server";

import { db } from "@/database/db";
import { events, ticketTiers, eventTickets, eventTicketPurchases } from "@/database/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type CreateEventData = {
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  yachtName?: string;
  totalCapacity: number;
  isActive: boolean;
  stripeProductId?: string;
  ticketTiers: Array<{
    name: string;
    price: string;
    maxQuantity: number;
    sortOrder: number;
    stripePriceId?: string;
    isActive: boolean;
    saleStartDate?: string;
    saleEndDate?: string;
  }>;
};

export type UpdateEventData = CreateEventData & {
  id: string;
};

/**
 * Create a new event with ticket tiers
 */
export async function createEvent(eventData: CreateEventData) {
  try {
    // Create the event
    const [newEvent] = await db.insert(events).values({
      title: eventData.title,
      slug: eventData.slug,
      description: eventData.description,
      eventDate: new Date(eventData.eventDate),
      startTime: eventData.startTime ? new Date(`${eventData.eventDate}T${eventData.startTime}`) : null,
      endTime: eventData.endTime ? new Date(`${eventData.eventDate}T${eventData.endTime}`) : null,
      location: eventData.location,
      yachtName: eventData.yachtName,
      totalCapacity: eventData.totalCapacity,
      isActive: eventData.isActive,
      stripeProductId: eventData.stripeProductId,
    }).returning();

    // Create ticket tiers
    if (eventData.ticketTiers.length > 0) {
      await db.insert(ticketTiers).values(
        eventData.ticketTiers.map(tier => ({
          eventId: newEvent.id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.maxQuantity,
          sortOrder: tier.sortOrder,
          stripePriceId: tier.stripePriceId,
          isActive: tier.isActive,
          saleStartDate: tier.saleStartDate ? new Date(tier.saleStartDate) : null,
          saleEndDate: tier.saleEndDate ? new Date(tier.saleEndDate) : null,
        }))
      );
    }

    revalidatePath("/admin/events");
    return { success: true, event: newEvent };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(eventData: UpdateEventData) {
  try {
    // Update the event
    await db.update(events)
      .set({
        title: eventData.title,
        slug: eventData.slug,
        description: eventData.description,
        eventDate: new Date(eventData.eventDate),
        startTime: eventData.startTime ? new Date(`${eventData.eventDate}T${eventData.startTime}`) : null,
        endTime: eventData.endTime ? new Date(`${eventData.eventDate}T${eventData.endTime}`) : null,
        location: eventData.location,
        yachtName: eventData.yachtName,
        totalCapacity: eventData.totalCapacity,
        isActive: eventData.isActive,
        stripeProductId: eventData.stripeProductId,
      })
      .where(eq(events.id, eventData.id));

    // Delete existing ticket tiers and recreate them
    await db.delete(ticketTiers).where(eq(ticketTiers.eventId, eventData.id));
    
    if (eventData.ticketTiers.length > 0) {
      await db.insert(ticketTiers).values(
        eventData.ticketTiers.map(tier => ({
          eventId: eventData.id,
          name: tier.name,
          price: tier.price,
          maxQuantity: tier.maxQuantity,
          sortOrder: tier.sortOrder,
          stripePriceId: tier.stripePriceId,
          isActive: tier.isActive,
          saleStartDate: tier.saleStartDate ? new Date(tier.saleStartDate) : null,
          saleEndDate: tier.saleEndDate ? new Date(tier.saleEndDate) : null,
        }))
      );
    }

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

/**
 * Delete an event and all related data
 */
export async function deleteEvent(eventId: string) {
  try {
    await db.delete(events).where(eq(events.id, eventId));
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

/**
 * Get all events with their ticket tiers
 */
export async function getAllEvents() {
  try {
    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        eventDate: events.eventDate,
        startTime: events.startTime,
        endTime: events.endTime,
        location: events.location,
        yachtName: events.yachtName,
        totalCapacity: events.totalCapacity,
        isActive: events.isActive,
        stripeProductId: events.stripeProductId,
        createdAt: events.createdAt,
      })
      .from(events)
      .orderBy(desc(events.eventDate));

    // Get ticket tiers for each event
    const eventsWithTiers = await Promise.all(
      allEvents.map(async (event) => {
        const tiers = await db
          .select()
          .from(ticketTiers)
          .where(eq(ticketTiers.eventId, event.id))
          .orderBy(asc(ticketTiers.sortOrder));

        return {
          ...event,
          ticketTiers: tiers,
        };
      })
    );

    return eventsWithTiers;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Get a single event by ID with ticket tiers
 */
export async function getEventById(eventId: string) {
  try {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return null;
    }

    const tiers = await db
      .select()
      .from(ticketTiers)
      .where(eq(ticketTiers.eventId, eventId))
      .orderBy(asc(ticketTiers.sortOrder));

    return {
      ...event,
      ticketTiers: tiers,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

/**
 * Get active events (for public display)
 */
export async function getActiveEvents() {
  try {
    const activeEvents = await db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        eventDate: events.eventDate,
        startTime: events.startTime,
        endTime: events.endTime,
        location: events.location,
        yachtName: events.yachtName,
        totalCapacity: events.totalCapacity,
        stripeProductId: events.stripeProductId,
      })
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(asc(events.eventDate));

    // Get active ticket tiers for each event
    const eventsWithTiers = await Promise.all(
      activeEvents.map(async (event) => {
        const tiers = await db
          .select()
          .from(ticketTiers)
          .where(and(
            eq(ticketTiers.eventId, event.id),
            eq(ticketTiers.isActive, true)
          ))
          .orderBy(asc(ticketTiers.sortOrder));

        return {
          ...event,
          ticketTiers: tiers,
        };
      })
    );

    return eventsWithTiers;
  } catch (error) {
    console.error("Error fetching active events:", error);
    return [];
  }
}

/**
 * Get event statistics for admin dashboard
 */
export async function getEventStats() {
  try {
    // Get total events count
    const totalEvents = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(events);

    // Get active events count
    const activeEvents = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(events)
      .where(eq(events.isActive, true));

    // Get total tickets sold (count individual tickets)
    const ticketsSold = await db
      .select({ 
        totalCount: sql<number>`count(*)`.as('totalCount')
      })
      .from(eventTickets);

    // Get total revenue (from paid purchases)
    const revenue = await db
      .select({ 
        totalRevenue: sql<number>`coalesce(sum(${eventTicketPurchases.totalAmount}), 0)`.as('totalRevenue')
      })
      .from(eventTicketPurchases)
      .where(eq(eventTicketPurchases.isPaid, true));

    return {
      totalEvents: totalEvents[0]?.count || 0,
      activeEvents: activeEvents[0]?.count || 0,
      ticketsSold: Number(ticketsSold[0]?.totalCount) || 0,
      totalRevenue: Number(revenue[0]?.totalRevenue) || 0,
    };
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return {
      totalEvents: 0,
      activeEvents: 0,
      ticketsSold: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Get a single event by slug with ticket tiers
 */
export async function getEventBySlug(slug: string) {
  try {
    const event = await db.query.events.findFirst({
      where: and(eq(events.slug, slug), eq(events.isActive, true)),
      with: {
        ticketTiers: {
          orderBy: [asc(ticketTiers.sortOrder), asc(ticketTiers.id)],
          where: eq(ticketTiers.isActive, true),
        },
      },
    });

    return event || null;
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return null;
  }
}
