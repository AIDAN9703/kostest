import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers, createUser } from "@/features-admin/users/actions/users";

export async function GET(request: NextRequest) {
  try {
    // Admin-only route for all users
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';
    
    // If requesting all users for client-side filtering, fetch without pagination
    const options = fetchAll ? { limit: 1000 } : {}; // Reasonable limit for all users
    const result = await getAllUsers(options);
    
    return NextResponse.json({ 
      success: true, 
      users: result.users,
      totalCount: result.totalCount,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin authentication required for creating users
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const userData = await request.json();
    const user = await createUser(userData);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
