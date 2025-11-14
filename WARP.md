# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production application
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js, TypeScript, Standard, and Tailwind rules
```

### Database Management (Drizzle ORM + PostgreSQL)
```bash
npm run db:generate         # Generate migrations from schema changes
npm run db:migrate          # Apply migrations to database
npm run db:push             # Push schema changes directly to database (dev only)
npm run db:studio           # Open Drizzle Studio database browser
npm run db:seed-boats       # Seed database with sample boat data
npm run db:seed-reviews     # Seed database with review data
npm run db:setup-reviews    # Setup review system
npm run db:update-review-stats  # Calculate and update review statistics
```

### Code Quality Workflow
After making changes, always run:
1. `npm run lint` to check for linting issues
2. `npm run build` to ensure TypeScript compilation succeeds

## Project Architecture

### Technology Stack
This is a comprehensive **boat rental platform** built with:

- **Framework**: Next.js 15 with App Router, Server Components, and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4.x, shadcn/ui components  
- **Database**: PostgreSQL with Drizzle ORM and PostGIS for spatial data
- **Authentication**: NextAuth.js with Google OAuth and credentials providers
- **Maps**: Google Maps API with @vis.gl/react-google-maps and @react-google-maps/api
- **Payments**: Stripe integration with webhooks
- **Messaging**: Real-time messaging with Socket.io and Twilio SMS
- **Media**: ImageKit for image optimization and management
- **State Management**: Zustand for client state, URL state with nuqs
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation

### Directory Structure

#### Next.js App Router (Route Groups)
- `app/(root)/` - Main public pages (home, boat listings, experiences, services)
- `app/(auth)/` - Authentication pages (sign-in, sign-up, verify)  
- `app/(admin)/` - Admin dashboard pages
- `app/(profile)/` - User profile and dashboard pages
- `app/api/` - API routes for backend functionality

#### Component Organization
- `shared/components/` - All reusable UI components
  - `shared/components/ui/` - shadcn/ui base components
  - `shared/components/layout/` - Navigation, Footer, PageWrapper
- `features/` - Feature-specific components (messaging)
- `features-admin/` - Admin dashboard components and layouts

#### Data Layer Architecture
- `database/schema/` - Drizzle ORM schema with tables and enums
  - `database/schema/tables/` - Individual table definitions
  - `database/schema/enums/` - Enum definitions by domain
- `shared/types/` - TypeScript type definitions
- `shared/validation/` - Zod validation schemas
- `shared/utils/` - Utility functions (pricing, bookings, search params)
- `shared/services/` - External service integrations (Twilio, ImageKit, etc.)

### Core Business Logic

#### Multi-Entity Database Schema
The schema supports a comprehensive boat rental marketplace:
- **Users**: Multi-role system (USER, ADMIN, CAPTAIN, BROKER, OWNER) with verification
- **Boats**: Full specifications with pricing tiers, location data, and feature management
- **Bookings**: Unified system supporting instant bookings and approval-required requests
- **Reviews**: Multi-entity reviews for boats, captains, and users
- **Notifications**: Built-in notification system with Twilio integration
- **Messaging**: Real-time chat between users and owners
- **Events**: Event management with ticket systems

#### Booking System Architecture
Two main booking flows:
1. **Instant Bookings** - Immediate confirmation with payment processing
2. **Request Bookings** - Owner approval workflow with messaging integration

Both use shared pricing calculation logic and form persistence patterns.

#### Authentication & Authorization
- NextAuth.js with multiple providers (Google OAuth, credentials)
- Role-based access control (RBAC) with middleware protection
- Phone verification system via Twilio SMS
- Session management with comprehensive user profile tracking

#### Admin System Features
- Universal search across all entities with global search component
- Data tables with pagination, filtering, and sorting
- Universal update system for quick field modifications
- Quote generation with PDF export functionality
- Advanced analytics and user management

### Google Maps Integration

Extensive location-based functionality:
- Spatial queries for location-based boat search
- Interactive maps with custom markers and clustering
- Place autocomplete for address input with custom component
- Distance-based filtering and recommendations
- Integration with PostGIS for spatial data

**Required Google Maps APIs:**
- Maps JavaScript API
- Places API  
- Geocoding API

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in environment variables.

### Payment & Pricing System

Dynamic pricing architecture:
- **Boat Pricing Tiers** - Multiple hour-based pricing options per boat
- **Captain Fees** - Optional captain charges with separate pricing
- **Service Fees** - Platform booking fees
- **Cleaning Fees** - Per-booking cleaning charges
- **Tax Calculation** - Automatic tax computation
- **Stripe Integration** - Payment processing with webhook handling

See `shared/utils/pricing-utils.ts` for pricing calculation logic.

### State Management Patterns

- **Zustand** for client-side state (search filters, UI state)
- **URL State** via nuqs for search parameters and pagination
- **Server State** via Server Components and Server Actions
- **Form State** via React Hook Form with persistence

## Development Patterns

### Form Handling
- React Hook Form with Zod validation schemas
- Server actions for form submission with optimistic updates
- Multi-step forms with state persistence
- Custom form components following shadcn/ui patterns

### Error Handling & Loading States
- Custom error boundaries for graceful error handling
- Loading states and skeletons for better UX
- Comprehensive form validation with user-friendly messages
- Database transaction handling in server actions

### Image & Media Management
- ImageKit integration for optimized image delivery
- Next.js Image component with remote patterns configured
- File upload components with validation
- Lazy loading strategies throughout the application

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
```

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path mapping configured (`@/*` points to root)
- Next.js plugin integration for optimal development experience

### ESLint & Code Style
- Next.js core web vitals and TypeScript rules
- Standard JavaScript style guide
- Tailwind CSS recommended practices
- Prettier formatting integration

### Architecture Principles
- Server Components by default, Client Components when needed
- Proper separation of concerns between UI and business logic
- Consistent file naming and import ordering
- Comprehensive error boundaries and loading states
- Accessibility-first approach with semantic HTML and ARIA

## Database Development

### Schema Management
- Use migrations for all production schema changes
- Database schema organized by domain (users, boats, bookings, etc.)
- PostGIS extension enabled for spatial data operations
- Comprehensive indexing for performance optimization

### Testing Database Changes
- Test migrations on production data copies before deployment
- Use `npm run db:studio` for visual database exploration
- Seed scripts available for development data setup

## Integration Testing

### Payment Flow Testing
- Use Stripe test cards for payment validation
- Test webhook handling with Stripe CLI
- Verify booking confirmation workflows

### Authentication Testing
- Test both Google OAuth and credential flows
- Verify role-based access control
- Test phone verification with Twilio sandbox numbers

### Maps Integration Testing
- Verify location search and autocomplete functionality
- Test spatial queries and distance calculations
- Ensure proper marker clustering on search results

## Performance Considerations

### Next.js Optimizations
- Server Components maximize server-side rendering
- Turbopack enabled for faster development builds
- Image optimization with quality settings configured
- Route-based code splitting with App Router

### Database Performance
- Spatial indexing for location-based queries
- Optimized queries with Drizzle ORM
- Connection pooling configuration
- Query performance monitoring

This codebase represents a production-ready boat rental marketplace with comprehensive features including real-time messaging, payment processing, location-based search, and multi-role user management. The architecture prioritizes type safety, performance, and maintainability while leveraging the latest Next.js and React features.