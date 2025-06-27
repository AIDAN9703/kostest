# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Database Management
- `npx drizzle-kit generate` - Generate migrations from schema changes
- `npx drizzle-kit migrate` - Apply migrations to database
- `npx drizzle-kit push` - Push schema changes directly to database (dev only)
- `npx drizzle-kit studio` - Open Drizzle Studio database browser
- `npx tsx database/seed-boats.ts` - Seed the database with sample boat data

### Type Checking & Code Quality
After making changes, always run:
1. `npm run lint` to check for linting issues
2. `npm run build` to ensure TypeScript compilation succeeds

## Project Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router and Server Components
- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM and PostGIS for spatial data
- **Authentication**: NextAuth.js with Google OAuth and credentials providers
- **Maps**: Google Maps API with @vis.gl/react-google-maps
- **Payments**: Stripe integration
- **Messaging**: Twilio for SMS/phone verification
- **Media**: ImageKit for image optimization
- **Animations**: Framer Motion

### Directory Structure

#### App Router Organization
The app uses Next.js 15 App Router with route groups:
- `app/(root)/` - Main public pages (home, boat listings, experiences, services)
- `app/(auth)/` - Authentication pages (sign-in, sign-up, verify)
- `app/(admin)/` - Admin dashboard pages
- `app/(profile)/` - User profile and dashboard pages
- `app/api/` - API routes for backend functionality

#### Component Architecture
- `components/` - All reusable UI components
  - `components/ui/` - shadcn/ui base components
  - `components/boats/` - Boat-related components including booking forms
  - `components/admin/` - Admin dashboard components
  - `components/navigation/` - Header, footer, navigation components
  - `components/home/` - Homepage-specific components

#### Data Layer
- `database/schema.ts` - Complete Drizzle ORM schema with comprehensive boat rental platform entities
- `lib/actions/` - Server actions organized by domain (admin, auth, booking, etc.)
- `lib/validation/` - Zod validation schemas
- `lib/utils/` - Utility functions for pricing, bookings, search params, etc.

### Key Architectural Patterns

#### Database Schema Design
The schema supports a comprehensive boat rental platform with:
- **Users**: Multi-role system (USER, ADMIN, CAPTAIN, BROKER, OWNER) with verification tracking
- **Boats**: Full boat specifications with pricing tiers, location data, and feature management
- **Bookings**: Unified booking system supporting instant bookings and requests
- **Reviews**: Multi-entity review system for boats, captains, and users
- **Notifications**: Built-in notification system with Twilio integration
- **Verifications**: Phone/email verification system with multiple channels

#### Booking System Architecture
The booking system has two main flows:
1. **Instant Bookings** (`InstantBookingForm.tsx`) - Immediate confirmation with payment
2. **Booking Requests** (`RequestBookingForm.tsx`) - Request approval workflow

Both use shared components in `components/boats/listing/booking-form/shared/` and custom hooks for price calculation and form persistence.

#### Authentication Flow
- NextAuth.js with multiple providers (Google OAuth, credentials)
- Custom session management with role-based access control
- Phone verification system integrated with Twilio
- User profile management with comprehensive verification tracking

#### Admin System
Full-featured admin dashboard with:
- Universal search across all entities (`GlobalSearch.tsx`)
- Data tables with pagination and filtering
- Universal update system for quick field modifications
- Quote generation and PDF export functionality

### Google Maps Integration

The application extensively uses Google Maps:
- Location-based boat search with spatial queries
- Interactive maps for boat listings
- Place autocomplete for address input
- Custom markers with clustering for search results
- Distance-based filtering

Required Google Maps APIs:
- Maps JavaScript API
- Places API  
- Geocoding API

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in environment variables.

### Form Handling Patterns

Forms use React Hook Form with Zod validation:
- Server actions for form submission
- Optimistic updates where appropriate
- Form persistence for booking flows
- Multi-step forms with state management

### Pricing System

Dynamic pricing system with:
- **Boat Pricing Tiers** - Multiple hour-based pricing options per boat
- **Captain Fees** - Optional captain charges
- **Service Fees** - Platform booking fees
- **Cleaning Fees** - Per-booking cleaning charges
- **Tax Calculation** - Automatic tax computation

See `lib/utils/pricing-utils.ts` for pricing calculation logic.

### State Management

- **Zustand** for client state (search filters, UI state)
- **Server State** via Server Components and Actions
- **Form State** via React Hook Form
- **URL State** for search parameters and pagination

### Error Handling

- Custom error boundaries for graceful error handling
- Comprehensive form validation with user-friendly messages
- Database transaction handling in server actions
- Stripe webhook error handling and retry logic

## Development Workflows

### Adding New Features
1. Define database schema changes in `database/schema.ts`
2. Generate and run migrations: `npx drizzle-kit generate && npx drizzle-kit migrate`
3. Create server actions in appropriate `lib/actions/` subdirectory
4. Add validation schemas in `lib/validation/`
5. Build UI components following existing patterns
6. Test with both development server and production build

### Database Changes
- Always use migrations for schema changes in production
- Use `npx drizzle-kit push` only for local development
- Test migrations on a copy of production data before deploying
- Consider data migration scripts for complex schema changes

### Authentication Testing
- Test both Google OAuth and credentials login flows
- Verify role-based access control for admin features
- Test phone verification with Twilio sandbox numbers
- Ensure session persistence across browser restarts

### Payment Integration Testing
- Use Stripe test cards for payment flow testing
- Test webhook handling with Stripe CLI
- Verify booking confirmation emails and SMS notifications
- Test refund and cancellation workflows

## Environment Configuration

Key environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` - Google OAuth credentials
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe keys
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` - Twilio credentials
- `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` - ImageKit configuration

## Code Quality Standards

- Use TypeScript strict mode for type safety
- Follow Next.js App Router patterns with Server/Client Components
- Implement proper error boundaries and loading states
- Use semantic HTML and ARIA attributes for accessibility
- Optimize images with Next.js Image component
- Follow the existing naming conventions and file organization
- Write comprehensive JSDoc comments for complex functions
- Use consistent import ordering (React, Next.js, third-party, local)

## Testing Approach

While formal tests aren't currently implemented, follow these testing practices:
- Manual testing of all booking flows
- Cross-browser testing for map functionality  
- Mobile responsiveness testing
- Admin dashboard functionality testing
- Payment flow testing with Stripe test data
- Database transaction integrity testing