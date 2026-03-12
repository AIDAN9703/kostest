import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventById } from "@/features/events/events.service";
import config from "@/shared/lib/config";
import { getStripe } from "@/shared/lib/services/stripe.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = id;
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tickets, customerInfo } = body;

    // Validate request
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        { success: false, error: "No tickets selected" },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return NextResponse.json(
        { success: false, error: "Customer information is required" },
        { status: 400 }
      );
    }

    // Get event details
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, error: "Event is not active" },
        { status: 400 }
      );
    }

    // Check if event has passed
    if (new Date(event.eventDate) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Event has already passed" },
        { status: 400 }
      );
    }

    // Validate tickets and calculate total
    let totalAmount = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const ticket of tickets) {
      const tier = event.ticketTiers.find(t => t.id === ticket.tierId);
      if (!tier) {
        return NextResponse.json(
          { success: false, error: `Invalid ticket tier: ${ticket.tierId}` },
          { status: 400 }
        );
      }

      if (!tier.isActive) {
        return NextResponse.json(
          { success: false, error: `Ticket tier "${tier.name}" is not available` },
          { status: 400 }
        );
      }

      const available = tier.maxQuantity - (tier.soldQuantity || 0);
      if (ticket.quantity > available) {
        return NextResponse.json(
          { success: false, error: `Not enough tickets available for "${tier.name}". Only ${available} left.` },
          { status: 400 }
        );
      }

      const ticketPrice = parseFloat(tier.price);
      totalAmount += ticketPrice * ticket.quantity;

      // Use Stripe Price ID if available, otherwise create price on the fly
      if (tier.stripePriceId) {
        lineItems.push({
          price: tier.stripePriceId,
          quantity: ticket.quantity,
        });
      } else {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} - ${tier.name}`,
              description: `Ticket for ${event.title} on ${new Date(event.eventDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(ticketPrice * 100), // Convert to cents
          },
          quantity: ticket.quantity,
        });
      }
    }

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${config.baseUrl}/events/${event.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.baseUrl}/events/${event.slug}`,
      customer_email: customerInfo.email,
      metadata: {
        type: 'EVENT_TICKET',
        eventId: event.id,
        eventSlug: event.slug,
        eventTitle: event.title,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        ticketsData: JSON.stringify(tickets),
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
