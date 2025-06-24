# Booking Form Components

This folder contains a modular booking form system designed for optimal user experience on boat charter listings.

## Key Features

- **Condensed Design**: Optimized for sticky sidebars and mobile views
- **Progressive Disclosure**: Core booking info first, additional options expandable
- **Form Persistence**: Data persists through authentication flow using localStorage
- **Authentication Integration**: Modal-based sign-in/sign-up without page navigation
- **Transparent Pricing**: All pricing options visible upfront

## Components

### Main Components
- **`BookingForm.tsx`** - Core form logic with state management and submission
- **`BookingFormToggle.tsx`** - Tab wrapper for Request vs Instant booking
- **`index.ts`** - Exports for easy importing

### Sub-Components
- **`PricingDisplay.tsx`** - Pricing tier selection with compact display
- **`BookingDetails.tsx`** - Date, time, and passenger selection
- **`CaptainSelection.tsx`** - Captain service options (if applicable)
- **`SpecialRequests.tsx`** - Expandable textarea for special requests
- **`PriceSummary.tsx`** - Compact price breakdown
- **`AuthModal.tsx`** - Authentication modal for non-logged-in users

## Usage

```tsx
import BookingFormToggle from "@/components/boats/listing/booking-form";

// Use in your boat listing page
<BookingFormToggle boat={boat} user={user} />
```

## Design Philosophy

- **Sticky-Friendly**: Condensed vertical layout prevents overflow in sticky containers
- **Mobile-First**: Optimized for small screens with touch-friendly controls
- **User-Centric**: Authentication only required at submission, not exploration
- **Persistent**: Form data survives page refreshes and authentication flows 