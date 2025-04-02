# VisGL Google Maps Integration with PostGIS

This document outlines the proper approach to integrating `@vis.gl/react-google-maps` with PostGIS location data in a Next.js application.

## Implementation Status

We have successfully implemented the Google Maps integration for the boat search page using the following approach:

1. Created a clean, simplified map component in `components/boats/search/VisGLSearchMap.tsx` that:
   - Uses the `@vis.gl/react-google-maps` library directly
   - Properly handles API key loading and error states
   - Implements markers with colored indicators based on boat category
   - Displays info windows with boat details when markers are clicked

2. Updated the server action in `lib/actions/boat-actions.ts` to:
   - Properly extract coordinate data from the PostGIS `location` column using `ST_X` and `ST_Y` functions
   - Return properly formatted location data for the map

## Current Implementation Details

### Map Component

The new map component in `components/boats/search/VisGLSearchMap.tsx`:
- Uses the `useMap` hook to access the map instance
- Automatically fits bounds to show all markers
- Implements custom styled markers based on boat category
- Shows detailed info windows when markers are clicked

### Database Integration

The server action in `lib/actions/boat-actions.ts` now:
- Uses a direct SQL query to extract PostGIS coordinates properly
- Properly formats the SQL query to avoid parameter binding issues with PostGIS
- Converts the coordinates to the format expected by Google Maps (latitude/longitude)
- Filters out boats without valid location data

### Code Cleanup

We've improved the implementation with several cleanup steps:

1. **Map Component Cleanup**:
   - Removed unused map styles that weren't being applied correctly
   - Enabled fullscreen control for better user experience
   - Simplified component structure for better maintainability

2. **Server Action Cleanup**:
   - Streamlined the location data fetching logic
   - Improved error handling to gracefully degrade if location data can't be fetched
   - Added clearer comments for future maintenance

### Troubleshooting SQL Parameter Binding Issues

We encountered and fixed an error with SQL parameter binding when working with PostGIS data:

**Error**: `syntax error at or near "$2"`

**Solution**:
1. We replaced the problematic `sql` template tag with a direct string query for the location data
2. We manually format the boat IDs as a comma-separated list of quoted UUIDs
3. This approach is safe as we're only working with IDs from our own database (not user input)

```typescript
// Format IDs for SQL query - this avoids parameter binding issues with PostgreSQL/PostGIS
const idList = typedResults.map(boat => `'${boat.id}'`).join(',');

// Use raw SQL to extract PostGIS coordinates
// This is simpler and more reliable than using the ORM for spatial data
const query = `
  SELECT 
    id, 
    name, 
    category, 
    hourly_rate as price,
    main_image as image_url,
    ST_Y(location::geometry) as latitude, 
    ST_X(location::geometry) as longitude
  FROM boat 
  WHERE id IN (${idList})
    AND location IS NOT NULL
`;

const locationResults = await db.execute(query);
```

## Testing the Implementation

To test that the implementation is working correctly:

1. Ensure you have a valid Google Maps API key in your `.env.local` file:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

2. Make sure some boats in your database have valid PostGIS location data:
   - You can test by running a query like:
   ```sql
   UPDATE boat SET location = ST_SetSRID(ST_MakePoint(-80.1918, 25.7617), 4326) WHERE id = 'your_boat_id';
   ```
   - This sets the location to Miami coordinates (longitude first, latitude second in PostGIS)

3. Navigate to the `/boats/search` page and verify:
   - The map loads successfully
   - Boat markers appear at the correct locations
   - Clicking a marker shows details for that boat
   - The map is responsive and performance is good

## Next Steps

If you want to enhance this implementation further:

1. **Add map clustering**: For areas with many boats, implement marker clustering
2. **Implement "search this area"**: Add a button to search for boats within the current map view
3. **Optimize map performance**: Add virtualization for large datasets
4. **Add map controls**: Implement custom map controls if needed
5. **Mobile optimizations**: Ensure the map is fully responsive on mobile devices

## Troubleshooting

If you encounter issues:

1. **Map doesn't appear**: Check that your Google Maps API key is valid and has the correct APIs enabled (Maps JavaScript API, Places API)
2. **No markers shown**: Verify that boats have valid location data in the database
3. **Performance issues**: Consider implementing clustering for large datasets
4. **SQL errors**: If you see SQL errors related to parameter binding, check that the SQL query is properly formatted

## Resources

- [@vis.gl/react-google-maps Documentation](https://visgl.github.io/react-google-maps/)
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Drizzle ORM PostGIS Documentation](https://orm.drizzle.team/docs/column-types/pg#postgis) 