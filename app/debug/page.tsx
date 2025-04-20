// app/debug/featured-boats/page.tsx
import { getFeaturedBoats } from "@/lib/actions/home-page/featured-boats";

export default async function DebugFeaturedBoats() {
  const response = await getFeaturedBoats();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Featured Boats Debug</h1>
      <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-[80vh]">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}