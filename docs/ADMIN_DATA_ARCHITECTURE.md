# Admin Data Architecture Guide

## 🏗️ Overview

This document explains our clean, scalable admin data architecture that separates concerns and eliminates duplication. The architecture follows a **CUD (Create, Update, Delete)** pattern for mutations and **React Query** for all read operations.

## 📁 File Structure

```
features/users/
├── mutations.ts              # Server Actions (CUD operations)
├── api.ts                    # Client-side API functions (Read operations)
├── hooks/
│   ├── useUsers.ts          # React Query hooks for data fetching
│   └── useUserMutations.ts  # React Query mutation hooks
└── components/
    └── ModernUsersTable.tsx # Presentational components

shared/services/
└── users.service.ts         # Database interaction layer

app/api/admin/users/
├── route.ts                 # GET /api/admin/users (paginated list)
└── [id]/route.ts           # GET /api/admin/users/[id] (single user)

database/schema/
└── types.ts                # Centralized type definitions
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PAGE COMPONENT                          │
│  - useUsers(filters) - React Query data fetching          │
│  - useDeleteUser() - Mutation hook                         │
│  - URL state with nuqs                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 REACT QUERY LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ useUsers()  │ │ useUser()   │ │ Mutations   │          │
│  │ - Caching   │ │ - Single    │ │ - CUD ops   │          │
│  │ - Auto refetch│ │ - Caching  │ │ - Cache inv │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 API LAYER                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ GET /users  │ │ GET /users/ │ │ Server      │          │
│  │ - Paginated │ │ [id]        │ │ Actions     │          │
│  │ - Filtered  │ │ - Single    │ │ - CUD ops   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 SERVICE LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ getAllUsers │ │ getUserById │ │ CUD Methods │          │
│  │ - Filters   │ │ - Single    │ │ - Database  │          │
│  │ - Pagination│ │ - Caching   │ │ - Business  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 DATABASE LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Drizzle ORM │ │ PostgreSQL  │ │ Type Safety │          │
│  │ - Queries   │ │ - Database  │ │ - Schema    │          │
│  │ - Relations │ │ - ACID      │ │ - Validation│          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Layer Responsibilities

### 1. **Database Schema Layer** (`database/schema/`)
- **Purpose**: Single source of truth for all types
- **Files**: `types.ts`, `tables/`, `enums/`
- **Responsibilities**:
  - Define database schema with Drizzle ORM
  - Export inferred types (`User`, `NewUser`, `UserFilters`)
  - Provide type safety across the entire application

```typescript
// database/schema/types.ts
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  page?: number;
  limit?: number;
}
```

### 2. **Service Layer** (`shared/services/users.service.ts`)
- **Purpose**: Pure database operations and business logic
- **Responsibilities**:
  - Write Drizzle queries
  - Handle complex filtering and pagination
  - Manage database transactions
  - Apply business rules
  - **NO authentication or revalidation**

```typescript
// shared/services/users.service.ts
export class UserService {
  async getAllUsers(filters?: UserFilters): Promise<PaginatedUsersResponse> {
    // Complex Drizzle queries with filters, pagination, etc.
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User[]> {
    // Pure database update operation
  }
  
  async deleteUser(id: string): Promise<void> {
    // Pure database delete operation
  }
}
```

### 3. **API Routes Layer** (`app/api/admin/users/`)
- **Purpose**: HTTP endpoints for read operations
- **Responsibilities**:
  - Handle HTTP requests
  - Authentication and authorization
  - Input validation
  - Call service layer methods
  - Return JSON responses

```typescript
// app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  // 1. Authenticate admin user
  // 2. Parse and validate query parameters
  // 3. Call userService.getAllUsers(filters)
  // 4. Return JSON response
}
```

### 4. **Client API Layer** (`features/users/api.ts`)
- **Purpose**: Client-side functions for making HTTP requests
- **Responsibilities**:
  - Make fetch requests to API routes
  - Handle response parsing
  - Provide clean interface for React components
  - **NO business logic**

```typescript
// features/users/api.ts
export const usersApi = {
  async getUsers(filters: UserFilters): Promise<PaginatedUsersResponse> {
    const response = await fetch(`/api/admin/users?${searchParams}`);
    return response.json();
  }
};
```

### 5. **Server Actions Layer** (`features/users/mutations.ts`)
- **Purpose**: Server-side CUD operations
- **Responsibilities**:
  - Authentication and authorization
  - Input validation
  - Call service layer methods
  - Handle revalidation
  - Return consistent response format

```typescript
// features/users/mutations.ts
export async function updateUser(id: string, updates: Partial<User>) {
  // 1. Authenticate user
  // 2. Call userService.updateUser(id, updates)
  // 3. Revalidate paths
  // 4. Return ActionResponse
}
```

### 6. **React Query Hooks Layer** (`features/users/hooks/`)
- **Purpose**: Caching, state management, and React integration
- **Responsibilities**:
  - Cache API responses
  - Handle loading and error states
  - Invalidate cache after mutations
  - Provide optimistic updates
  - **NO business logic**

```typescript
// features/users/hooks/useUsers.ts
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// features/users/hooks/useUserMutations.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 7. **Page Component Layer** (`app/(protected)/(admin)/admin/users/page.tsx`)
- **Purpose**: Orchestrate data flow and user interactions
- **Responsibilities**:
  - Manage URL state with nuqs
  - Call React Query hooks
  - Pass props to presentational components
  - Handle user interactions
  - **NO business logic or data fetching**

```typescript
// app/(protected)/(admin)/admin/users/page.tsx
export default function UsersPage() {
  const [filters, setFilters] = useQueryStates({...});
  const { data, isLoading } = useUsers(filters);
  const deleteUser = useDeleteUser();
  
  return (
    <ModernUsersTable 
      users={data?.users || []}
      onDelete={deleteUser.mutate}
      onPageChange={handlePageChange}
    />
  );
}
```

### 8. **Presentational Components Layer** (`features/users/components/`)
- **Purpose**: Pure UI components
- **Responsibilities**:
  - Render data
  - Handle user interactions
  - Call mutation hooks
  - **NO business logic, NO data fetching**

```typescript
// features/users/components/ModernUsersTable.tsx
interface ModernUsersTableProps {
  users: User[];
  pagination: PaginationInfo;
  onDelete: (userId: string) => void;
  onPageChange: (page: number) => void;
}

export function ModernUsersTable({ users, pagination, onDelete, onPageChange }: ModernUsersTableProps) {
  // Pure presentational logic
}
```

## 🔄 Data Flow Examples

### **Reading Data (GET)**
```
1. Page Component calls useUsers(filters)
2. useUsers calls usersApi.getUsers(filters)
3. usersApi makes fetch request to /api/admin/users
4. API route authenticates and calls userService.getAllUsers(filters)
5. Service executes Drizzle query and returns data
6. Data flows back through layers with caching
```

### **Updating Data (PUT/PATCH)**
```
1. User clicks dropdown in ModernUsersTable
2. FieldDropdown calls useUpdateUser().mutate({ id, updates })
3. useUpdateUser calls updateUser(id, updates) server action
4. Server action authenticates and calls userService.updateUser(id, updates)
5. Service executes Drizzle update query
6. Server action revalidates paths
7. React Query invalidates cache and refetches data
```

## 🎯 Key Benefits

### **✅ Separation of Concerns**
- Each layer has a single responsibility
- Easy to test and maintain
- Clear boundaries between layers

### **✅ No Duplication**
- Database logic only in service layer
- Authentication only in API routes and server actions
- Caching only in React Query hooks

### **✅ Type Safety**
- All types inferred from database schema
- End-to-end type safety
- IntelliSense support throughout

### **✅ Scalability**
- Easy to add new entities (boats, bookings, etc.)
- Consistent patterns across the application
- Reusable components and hooks

### **✅ Performance**
- Automatic caching with React Query
- Optimistic updates for better UX
- Efficient re-renders with proper memoization

## 🚀 How to Add New Entities

### **Step 1: Create Database Schema**
```typescript
// database/schema/tables/boats.table.ts
export const boats = pgTable("boats", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  name: text("name").notNull(),
  // ... other fields
});
```

### **Step 2: Add Types**
```typescript
// database/schema/types.ts
export type Boat = typeof boats.$inferSelect;
export type NewBoat = typeof boats.$inferInsert;
export interface BoatFilters {
  search?: string;
  category?: BoatCategory;
  // ... other filters
}
```

### **Step 3: Create Service Layer**
```typescript
// shared/services/boats.service.ts
export class BoatService {
  async getAllBoats(filters?: BoatFilters): Promise<PaginatedBoatsResponse> {
    // Drizzle queries
  }
  
  async updateBoat(id: string, data: Partial<Boat>): Promise<Boat[]> {
    // Database operations
  }
}
```

### **Step 4: Create API Routes**
```typescript
// app/api/admin/boats/route.ts
export async function GET(request: NextRequest) {
  // Authentication + service call
}
```

### **Step 5: Create Client API**
```typescript
// features/boats/api.ts
export const boatsApi = {
  async getBoats(filters: BoatFilters): Promise<PaginatedBoatsResponse> {
    // HTTP requests
  }
};
```

### **Step 6: Create Mutations**
```typescript
// features/boats/mutations.ts
export async function updateBoat(id: string, updates: Partial<Boat>) {
  // Authentication + service call + revalidation
}
```

### **Step 7: Create React Query Hooks**
```typescript
// features/boats/hooks/useBoats.ts
export function useBoats(filters: BoatFilters = {}) {
  return useQuery({
    queryKey: ['boats', 'list', filters],
    queryFn: () => boatsApi.getBoats(filters),
  });
}

// features/boats/hooks/useBoatMutations.ts
export function useUpdateBoat() {
  return useMutation({
    mutationFn: ({ id, updates }) => updateBoat(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boats'] }),
  });
}
```

### **Step 8: Create Page Component**
```typescript
// app/(protected)/(admin)/admin/boats/page.tsx
export default function BoatsPage() {
  const [filters, setFilters] = useQueryStates({...});
  const { data, isLoading } = useBoats(filters);
  const deleteBoat = useDeleteBoat();
  
  return <ModernBoatsTable {...props} />;
}
```

## 🔧 Best Practices

### **✅ Do's**
- Keep each layer focused on its responsibility
- Use the service layer for all database operations
- Leverage React Query for caching and state management
- Use TypeScript types from database schema
- Implement proper error handling at each layer
- Use optimistic updates for better UX

### **❌ Don'ts**
- Don't put database queries in components
- Don't duplicate authentication logic
- Don't mix business logic with UI logic
- Don't bypass the service layer
- Don't hardcode types when you can infer them
- Don't forget to invalidate cache after mutations

## 🐛 Common Issues & Solutions

### **Issue: Stale Data After Updates**
**Solution**: Ensure mutations invalidate the correct query keys
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
}
```

### **Issue: Type Errors**
**Solution**: Use inferred types from database schema
```typescript
import { type User, type NewUser } from '@/database/schema/types';
```

### **Issue: Authentication Errors**
**Solution**: Ensure API routes and server actions check authentication
```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
```

### **Issue: Performance Problems**
**Solution**: Use React Query's caching and implement proper memoization
```typescript
const { data } = useQuery({
  queryKey: ['users', 'list', filters],
  queryFn: () => usersApi.getUsers(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Nuqs (URL State Management)](https://nuqs.47ng.com/)

---

**This architecture provides a solid foundation for building scalable, maintainable admin interfaces. Follow these patterns consistently across your application for the best results!** 🚀
