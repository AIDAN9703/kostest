# Boat Rental Platform

This is a modern boat rental platform built with Next.js, Drizzle ORM, and PostgreSQL.

## Google Maps Integration

This project uses Google Maps for location-based searching and boat position display. To use the Google Maps features:

1. **Get API Key**: Obtain a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

2. **Configure API Key**: Add your API key to the `.env` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Features Implemented**:
   - Location search with Google Places Autocomplete
   - Map display of boat locations with custom markers and clustering
   - Location-based filtering for boats
   - Distance radius filtering
   - Interactive map for selecting boat locations during listing creation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Set up a PostgreSQL database (local or cloud-based like Neon)
2. Add the database URL to your `.env` file:
   ```
   DATABASE_URL=your_db_url_here
   ```
3. Run database migrations:
   ```bash
   npx drizzle-kit push:pg
   ```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL, Drizzle ORM
- **Maps**: Google Maps API, Places API
- **Authentication**: NextAuth
- **Deployment**: Vercel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
