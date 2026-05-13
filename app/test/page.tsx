"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  Filter,
  MoreHorizontal,
  Users,
  Ship,
  LayoutDashboard,
  Calendar,
  DollarSign,
  FileText,
  Settings as SettingsIcon,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Check,
  X,
  Send,
  Download,
  CreditCard,
  MapPin,
  Clock,
  User,
  Anchor,
  Compass,
  TrendingUp,
  Eye,
  Edit,
  Mail,
  Phone,
} from "lucide-react";

type Booking = {
  id: number;
  date: string;
  client: string;
  email: string;
  phone: string;
  boat: string;
  boatId: string;
  owner: string;
  captain: string;
  duration: number;
  time: string;
  gmv: number;
  expense: number;
  revenue: number;
  clientPaid: number;
  ownerSent: number;
  ownerBalance: number;
  source: string;
  agent: string;
  commission: number;
  status: string;
  paid: boolean;
  contract: boolean;
  note?: string;
};

type ViewId =
  | "dashboard"
  | "bookings"
  | "clients"
  | "boats"
  | "agents"
  | "invoicing"
  | "settings";

type LifecycleStatusBadge = "paid" | "pending" | "confirmed" | "completed" | "cancelled";

type NewBookingFormData = {
  client: string;
  email: string;
  phone: string;
  boat: string;
  captain: string;
  date: string;
  time: string;
  duration: string;
  gmv: string;
  expense: string;
  source: string;
  agent: string;
  notes: string;
};

type ClientSummary = {
  name: string;
  email: string;
  phone: string;
  count: number;
  total: number;
};

type AgentAgg = {
  code: string;
  count: number;
  gmv: number;
  commission: number;
};

type SidebarNavItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export default function KOSAdminPortal() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);

  // Mock data pulled from your actual spreadsheet
  const bookings: Booking[] = [
    {
      id: 2699,
      date: "2026-04-29",
      client: "Hannah Aldridge",
      email: "aldridgehannah1@gmail.com",
      phone: "(407) 416-5xxx",
      boat: "40ft Schaefer",
      boatId: "B-001",
      owner: "M. Volpe",
      captain: "Tyler",
      duration: 12,
      time: "9:00 AM",
      gmv: 1200,
      expense: 900,
      revenue: 300,
      clientPaid: 1200,
      ownerSent: 900,
      ownerBalance: 0,
      source: "Direct",
      agent: "BS",
      commission: 300,
      status: "confirmed",
      paid: true,
      contract: true,
      note: "Sent Jason Kaplan $100 referral commission",
    },
    {
      id: 2698,
      date: "2026-04-26",
      client: "Scotty Boca Bash",
      email: "eli@escorgroup.com",
      phone: "",
      boat: "88ft Azimut Cloud 9",
      boatId: "B-007",
      owner: "Tony Toscano",
      captain: "Tony Alex & Anna",
      duration: 24,
      time: "10:00 AM",
      gmv: 21500,
      expense: 21000,
      revenue: 500,
      clientPaid: 18000,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "AP",
      commission: 350,
      status: "confirmed",
      paid: false,
      contract: true,
      note: "kos collected 18k, tony collected 3.5k, mia quickbooks 18k",
    },
    {
      id: 2697,
      date: "2026-04-26",
      client: "Eli Soroudi",
      email: "eli@escorgroup.com",
      phone: "",
      boat: "88ft Azimut Cloud 9",
      boatId: "B-007",
      owner: "Tony Toscano",
      captain: "Tony, Tony Sr, Crystal",
      duration: 4,
      time: "11:00 AM",
      gmv: 6500,
      expense: 6500,
      revenue: 0,
      clientPaid: 0,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "AP",
      commission: 0,
      status: "confirmed",
      paid: false,
      contract: true,
      note: "alex collected 6000, kos collected 1500",
    },
    {
      id: 2696,
      date: "2026-04-26",
      client: "Redwood Retail",
      email: "",
      phone: "",
      boat: "68ft Azimut Paragon",
      boatId: "B-005",
      owner: "P. Tony",
      captain: "Tony Alex & Anna",
      duration: 4,
      time: "12:00 PM",
      gmv: 3000,
      expense: 600,
      revenue: 0,
      clientPaid: 3000,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "AP",
      commission: 350,
      status: "confirmed",
      paid: true,
      contract: true,
      note: "Michael Palm tree dropoff, 500 tip",
    },
    {
      id: 2695,
      date: "2026-04-25",
      client: "Harrison Goldberg",
      email: "harrison4812@icloud.com",
      phone: "(401) 808-9xxx",
      boat: "68ft Azimut Paragon",
      boatId: "B-005",
      owner: "P. Tony",
      captain: "Angel & Max",
      duration: 12,
      time: "10:00 AM",
      gmv: 1900,
      expense: 1900,
      revenue: 0,
      clientPaid: 0,
      ownerSent: 500,
      ownerBalance: 0,
      source: "Broker",
      agent: "AP",
      commission: 175,
      status: "confirmed",
      paid: false,
      contract: true,
      note: "2400 paid 500. zelle 2,000 and 300, refunded 500",
    },
    {
      id: 2694,
      date: "2026-04-25",
      client: "Martin Raynov",
      email: "raynovmartin@gmail.com",
      phone: "",
      boat: "68ft Azimut Paragon",
      boatId: "B-005",
      owner: "P. Tony",
      captain: "Mike & Anna",
      duration: 12,
      time: "10:00 AM",
      gmv: 3000,
      expense: 2500,
      revenue: 0,
      clientPaid: 3000,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "AP",
      commission: 175,
      status: "confirmed",
      paid: true,
      contract: true,
      note: "Sergio appletray alex 300, Martin Raynov $2,700, Sergio commission 450",
    },
    {
      id: 2693,
      date: "2026-04-24",
      client: "Caroline Thomdike",
      email: "carolinejdavidson1@gmail.com",
      phone: "",
      boat: "68ft Paragon",
      boatId: "B-005",
      owner: "P. Tony",
      captain: "Tony & Anna",
      duration: 1,
      time: "2:00 PM",
      gmv: 4900,
      expense: 4650,
      revenue: 250,
      clientPaid: 5000,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "AP",
      commission: 238,
      status: "completed",
      paid: true,
      contract: true,
      note: "Maddy",
    },
    {
      id: 2692,
      date: "2026-04-25",
      client: "Lanisa Davis",
      email: "lanisadavis@gmail.com",
      phone: "352-988-9xxx",
      boat: "68ft Azimut",
      boatId: "B-005",
      owner: "P. Tony",
      captain: "Tony & Max",
      duration: 12,
      time: "10:00 AM",
      gmv: 1600,
      expense: 1260,
      revenue: 340,
      clientPaid: 1600,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Broker",
      agent: "Angel",
      commission: 238,
      status: "completed",
      paid: true,
      contract: true,
      note: "Paid tony, Tony deducted commission and captain. Tony sent $1110",
    },
    {
      id: 2691,
      date: "2026-04-25",
      client: "Tom Crean",
      email: "",
      phone: "(617) 991-7959",
      boat: "45ft Sea Ray",
      boatId: "B-002",
      owner: "Sea Ray LLC",
      captain: "Kent May",
      duration: 4,
      time: "1:00 PM",
      gmv: 1325,
      expense: 1225,
      revenue: 100,
      clientPaid: 0,
      ownerSent: 0,
      ownerBalance: 1325,
      source: "Direct",
      agent: "LJ",
      commission: 70,
      status: "confirmed",
      paid: false,
      contract: true,
      note: "Sent 300, send 800 + 125",
    },
    {
      id: 2690,
      date: "2026-04-25",
      client: "Kyan Gibbs",
      email: "kyangibbs12@gmail.com",
      phone: "(773) 355-0xxx",
      boat: "27ft Pontoon Tyler",
      boatId: "B-008",
      owner: "Tyler Holdings",
      captain: "Tyler",
      duration: 4,
      time: "11:00 AM",
      gmv: 850,
      expense: 700,
      revenue: 150,
      clientPaid: 850,
      ownerSent: 0,
      ownerBalance: 0,
      source: "Direct",
      agent: "LJ",
      commission: 105,
      status: "completed",
      paid: true,
      contract: true,
      note: "Paid 250, Sent 250, Balance 600, Send 450 (120 tip)",
    },
  ];

  const sidebarItems: SidebarNavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar, badge: "47" },
    { id: "clients", label: "Clients", icon: Users },
    { id: "boats", label: "Boats & Owners", icon: Ship },
    { id: "agents", label: "Agents", icon: TrendingUp },
    { id: "invoicing", label: "Invoicing", icon: FileText },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="flex h-screen bg-stone-50 text-slate-900"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-stone-100 flex flex-col border-r border-slate-800">
        <div className="px-6 py-6 border-b border-slate-800">
          <div
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-2xl font-bold tracking-tight"
          >
            KOS<span className="text-amber-500">.</span>
          </div>
          <div className="text-xs text-stone-400 mt-1 tracking-widest">ADMIN PORTAL</div>
        </div>

        <nav className="flex-1 py-6 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setSelectedBooking(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition mb-1 ${
                  active ? "bg-stone-100 text-slate-900" : "text-stone-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${active ? "bg-slate-900 text-stone-100" : "bg-slate-800 text-stone-300"}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-semibold">
              LJ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Luke Jordan</div>
              <div className="text-xs text-stone-400">CEO</div>
            </div>
            <ChevronDown size={16} className="text-stone-400" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search bookings, clients, boats..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewBooking(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition"
            >
              <Plus size={16} />
              New Booking
            </button>
            <button className="w-9 h-9 rounded-md hover:bg-stone-100 flex items-center justify-center relative">
              <Bell size={18} className="text-stone-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {view === "dashboard" && (
            <Dashboard
              bookings={bookings}
              setView={setView}
              setSelectedBooking={setSelectedBooking}
            />
          )}
          {view === "bookings" && !selectedBooking && (
            <BookingsList bookings={bookings} setSelectedBooking={setSelectedBooking} />
          )}
          {view === "bookings" && selectedBooking && (
            <BookingDetail booking={selectedBooking} onBack={() => setSelectedBooking(null)} />
          )}
          {view === "clients" && <Clients bookings={bookings} />}
          {view === "boats" && <Boats />}
          {view === "agents" && <Agents bookings={bookings} />}
          {view === "invoicing" && <Invoicing bookings={bookings} />}
          {view === "settings" && <Settings />}
        </main>
      </div>

      {/* New Booking Modal */}
      {showNewBooking && <NewBookingModal onClose={() => setShowNewBooking(false)} />}
    </div>
  );
}

function Dashboard({
  bookings,
  setView,
  setSelectedBooking,
}: {
  bookings: Booking[];
  setView: (v: ViewId) => void;
  setSelectedBooking: (b: Booking | null) => void;
}) {
  const totalRev = bookings.reduce((s, b) => s + b.revenue, 0);
  const totalGMV = bookings.reduce((s, b) => s + b.gmv, 0);
  const pendingPayments = bookings.filter((b) => !b.paid).length;
  const totalCommissions = bookings.reduce((s, b) => s + b.commission, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-4xl font-semibold tracking-tight text-slate-900"
        >
          Welcome back, Luke
        </h1>
        <p className="text-stone-600 mt-1">Here is what is moving across the fleet today.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Gross Bookings (MTD)"
          value={`$${totalGMV.toLocaleString()}`}
          change="+18%"
          trend="up"
          accent={false}
          warning={false}
        />
        <KPICard
          label="Net Revenue (MTD)"
          value={`$${totalRev.toLocaleString()}`}
          change="+12%"
          trend="up"
          accent
          warning={false}
        />
        <KPICard
          label="Commissions Owed"
          value={`$${totalCommissions.toLocaleString()}`}
          change="6 agents"
          accent={false}
          warning={false}
        />
        <KPICard
          label="Pending Payments"
          value={pendingPayments}
          change="$8,420"
          trend="down"
          accent={false}
          warning
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <h2 className="font-semibold">Recent Bookings</h2>
            <button
              onClick={() => setView("bookings")}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {bookings.slice(0, 6).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setView("bookings");
                  setSelectedBooking(b);
                }}
                className="w-full flex items-center gap-4 px-6 py-3 hover:bg-stone-50 transition text-left"
              >
                <div className="w-10 h-10 rounded-md bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-700">
                  {b.client
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{b.client}</div>
                  <div className="text-xs text-stone-500 truncate">
                    {b.boat} · {b.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">${b.gmv.toLocaleString()}</div>
                  <StatusBadge status={b.paid ? "paid" : "pending"} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="font-semibold">This Week</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-amber-500 rounded-full" />
              <div>
                <div className="text-xs text-stone-500">Today, 2:00 PM</div>
                <div className="font-medium text-sm">Caroline Thomdike</div>
                <div className="text-xs text-stone-600">68ft Paragon · 1hr</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-stone-300 rounded-full" />
              <div>
                <div className="text-xs text-stone-500">Tomorrow, 9:00 AM</div>
                <div className="font-medium text-sm">Hannah Aldridge</div>
                <div className="text-xs text-stone-600">40ft Schaefer · 12hr</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1 h-12 bg-stone-300 rounded-full" />
              <div>
                <div className="text-xs text-stone-500">May 1, 10:00 AM</div>
                <div className="font-medium text-sm">Martin Raynov</div>
                <div className="text-xs text-stone-600">68ft Paragon · 12hr</div>
              </div>
            </div>
            <button className="w-full text-xs text-amber-700 hover:text-amber-800 font-medium pt-2">
              View full calendar
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-stone-400 tracking-widest mb-2">REVENUE BY SOURCE</div>
              <div style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold">
                ${totalGMV.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                across {bookings.length} bookings this period
              </div>
            </div>
            <Compass size={20} className="text-amber-500" />
          </div>
          <div className="mt-6 space-y-2">
            {[
              { label: "Direct", value: 62, amount: 28400 },
              { label: "Broker", value: 28, amount: 12800 },
              { label: "Referral", value: 10, amount: 4570 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300">{s.label}</span>
                  <span>${s.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-stone-500 tracking-widest mb-1">FOLLOW UPS</div>
              <h3 className="font-semibold">Leads waiting on you</h3>
            </div>
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
              3 overdue
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "David Reinhart",
                last: "2d ago",
                boat: "Inquiry: 60ft+ for 8 guests",
                overdue: true,
              },
              {
                name: "Jenna Pierce",
                last: "1d ago",
                boat: "Inquiry: 4 hr sunset cruise",
                overdue: true,
              },
              {
                name: "Alex Romano",
                last: "6h ago",
                boat: "Asked for pricing on Paragon",
                overdue: false,
              },
            ].map((l) => (
              <div
                key={l.name}
                className="flex items-center justify-between p-3 rounded-md border border-stone-100 hover:bg-stone-50"
              >
                <div>
                  <div className="font-medium text-sm">{l.name}</div>
                  <div className="text-xs text-stone-500">{l.boat}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${l.overdue ? "text-red-600" : "text-stone-500"}`}>
                    {l.last}
                  </span>
                  <button className="text-xs px-3 py-1 bg-slate-900 text-white rounded-md hover:bg-slate-800">
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  change,
  trend,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string | number;
  change: string;
  trend?: "up" | "down";
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-stone-200 p-5 ${accent ? "ring-1 ring-amber-500/30" : ""}`}
    >
      <div className="text-xs text-stone-500 tracking-widest mb-2">{label.toUpperCase()}</div>
      <div className="flex items-baseline justify-between">
        <div
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-3xl font-semibold text-slate-900"
        >
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${trend === "up" ? "text-emerald-600" : warning ? "text-amber-700" : "text-red-600"}`}
          >
            {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </div>
        )}
        {!trend && <span className="text-xs text-stone-500">{change}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: LifecycleStatusBadge }) {
  const styles: Record<LifecycleStatusBadge, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-stone-100 text-stone-700 border-stone-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}

function BookingsList({
  bookings,
  setSelectedBooking,
}: {
  bookings: Booking[];
  setSelectedBooking: (b: Booking | null) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (filter === "unpaid" && b.paid) return false;
    if (filter === "paid" && !b.paid) return false;
    if (
      search &&
      !b.client.toLowerCase().includes(search.toLowerCase()) &&
      !b.boat.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-3xl font-semibold tracking-tight"
          >
            Bookings
          </h1>
          <p className="text-stone-600 mt-1 text-sm">
            {filtered.length} of {bookings.length} bookings
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-stone-200 flex items-center gap-3">
          <div className="flex bg-stone-100 rounded-md p-0.5">
            {["all", "unpaid", "paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded transition ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-stone-600"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter bookings..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-md hover:bg-stone-50">
            <Filter size={12} /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-md hover:bg-stone-50">
            <Download size={12} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/50">
                <th className="text-left font-medium text-xs text-stone-500 px-6 py-3 tracking-wider">
                  DATE
                </th>
                <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  CLIENT
                </th>
                <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  BOAT
                </th>
                <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  CAPTAIN
                </th>
                <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  GMV
                </th>
                <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  REVENUE
                </th>
                <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  SOURCE
                </th>
                <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                  STATUS
                </th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="border-b border-stone-100 hover:bg-stone-50/70 cursor-pointer"
                >
                  <td className="px-6 py-3.5">
                    <div className="text-sm font-medium">{b.date}</div>
                    <div className="text-xs text-stone-500">
                      {b.duration}hr · {b.time}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{b.client}</div>
                    <div className="text-xs text-stone-500 truncate max-w-[180px]">{b.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-stone-700">{b.boat}</div>
                  </td>
                  <td className="px-4 py-3.5 text-stone-600">{b.captain}</td>
                  <td className="px-4 py-3.5 text-right font-medium">${b.gmv.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-emerald-700">
                    ${b.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-stone-700">{b.source}</span>
                    <div className="text-xs text-stone-500">{b.agent}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={b.paid ? "paid" : "pending"} />
                      {b.contract && (
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Check size={10} /> Contract
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3.5">
                    <ChevronRight size={16} className="text-stone-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BookingDetail({ booking, onBack }: { booking: Booking; onBack: () => void }) {
  return (
    <div className="p-8 max-w-6xl">
      <button
        onClick={onBack}
        className="text-sm text-stone-600 hover:text-slate-900 mb-4 flex items-center gap-1"
      >
        <ChevronRight size={14} className="rotate-180" /> Back to bookings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs text-stone-500 tracking-widest mb-1">BOOKING #{booking.id}</div>
          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-3xl font-semibold tracking-tight"
          >
            {booking.client}
          </h1>
          <p className="text-stone-600 mt-1 text-sm">
            {booking.boat} · {booking.date} · {booking.duration}hr
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-md hover:bg-stone-50 flex items-center gap-2">
            <Edit size={14} /> Edit
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 flex items-center gap-2">
            <Send size={14} /> Send Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="font-semibold mb-4">Charter Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail icon={Calendar} label="Date" value={booking.date} />
              <Detail icon={Clock} label="Duration" value={`${booking.duration} hours`} />
              <Detail icon={Ship} label="Boat" value={booking.boat} />
              <Detail icon={User} label="Captain" value={booking.captain} />
              <Detail icon={MapPin} label="Owner" value={booking.owner} />
              <Detail
                icon={Compass}
                label="Source"
                value={`${booking.source} · ${booking.agent}`}
              />
            </div>
            {booking.note && (
              <div className="mt-5 pt-5 border-t border-stone-100">
                <div className="text-xs text-stone-500 tracking-wider mb-1">INTERNAL NOTE</div>
                <div className="text-sm text-stone-700">{booking.note}</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="font-semibold mb-4">Financials</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Gross (GMV)</span>
                <span className="font-medium">${booking.gmv.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Owner expense</span>
                <span className="font-medium">${booking.expense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-900 font-medium">KOS revenue</span>
                <span className="font-semibold text-emerald-700">
                  ${booking.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Agent commission ({booking.agent})</span>
                <span>${booking.commission.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-stone-100 grid grid-cols-3 gap-3">
              <PaymentTile
                label="Client paid"
                amount={booking.clientPaid}
                ok={booking.clientPaid >= booking.gmv}
              />
              <PaymentTile
                label="Sent to owner"
                amount={booking.ownerSent}
                ok={booking.ownerSent >= booking.expense}
              />
              <PaymentTile
                label="Owner balance"
                amount={booking.ownerBalance}
                ok={booking.ownerBalance === 0}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="font-semibold mb-4">Activity</h2>
            <div className="space-y-3">
              {[
                { time: "2 days ago", text: "Contract sent and signed", icon: Check },
                { time: "2 days ago", text: "Invoice #" + booking.id + " created", icon: FileText },
                { time: "1 day ago", text: "Payment received via Stripe", icon: CreditCard },
                { time: "5 hours ago", text: "Captain confirmed for charter", icon: Anchor },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={12} className="text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{a.text}</div>
                      <div className="text-xs text-stone-500">{a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="font-semibold mb-4">Client</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-semibold">
                {booking.client
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="font-medium">{booking.client}</div>
                <div className="text-xs text-stone-500">3 lifetime bookings</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {booking.email && (
                <a
                  href={`mailto:${booking.email}`}
                  className="flex items-center gap-2 text-stone-700 hover:text-slate-900"
                >
                  <Mail size={14} className="text-stone-400" />
                  <span className="truncate">{booking.email}</span>
                </a>
              )}
              {booking.phone && (
                <a
                  href={`tel:${booking.phone}`}
                  className="flex items-center gap-2 text-stone-700 hover:text-slate-900"
                >
                  <Phone size={14} className="text-stone-400" />
                  {booking.phone}
                </a>
              )}
            </div>
            <button className="w-full mt-4 text-xs font-medium text-amber-700 hover:text-amber-800 py-2">
              View client profile
            </button>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="font-semibold mb-4">Status</h2>
            <div className="space-y-3 text-sm">
              <StatusRow label="Contract signed" done={booking.contract} />
              <StatusRow label="Client payment received" done={booking.paid} />
              <StatusRow label="Captain confirmed" done={true} />
              <StatusRow label="Owner paid out" done={booking.ownerSent >= booking.expense} />
              <StatusRow label="Post-trip review sent" done={false} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border border-amber-200 p-5">
            <div className="text-xs text-amber-800 tracking-widest mb-2">QUICK ACTIONS</div>
            <div className="space-y-1">
              <ActionLink>Resend invoice</ActionLink>
              <ActionLink>Send pre-trip info pack</ActionLink>
              <ActionLink>Trigger review request</ActionLink>
              <ActionLink>Refund / partial refund</ActionLink>
              <ActionLink>Duplicate booking</ActionLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500 tracking-wider flex items-center gap-1.5 mb-1">
        <Icon size={11} /> {label.toUpperCase()}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function PaymentTile({
  label,
  amount,
  ok,
}: {
  label: string;
  amount: number;
  ok: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-md border ${ok ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"}`}
    >
      <div className="text-xs text-stone-600 mb-1">{label}</div>
      <div className="font-semibold text-sm">${amount.toLocaleString()}</div>
    </div>
  );
}

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? "bg-emerald-100" : "bg-stone-100"}`}
      >
        {done ? (
          <Check size={12} className="text-emerald-700" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        )}
      </div>
      <span className={done ? "text-stone-900" : "text-stone-500"}>{label}</span>
    </div>
  );
}

function ActionLink({ children }: { children: ReactNode }) {
  return (
    <button className="w-full text-left text-sm text-amber-900 hover:text-amber-950 py-1.5 flex items-center justify-between group">
      <span>{children}</span>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
    </button>
  );
}

function NewBookingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<NewBookingFormData>({
    client: "",
    email: "",
    phone: "",
    boat: "",
    captain: "",
    date: "",
    time: "",
    duration: "",
    gmv: "",
    expense: "",
    source: "Direct",
    agent: "",
    notes: "",
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif" }} className="text-xl font-semibold">
              New Booking
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Replaces QuickBooks invoice + Sheet entry · Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-stone-100 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-stone-100 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? "bg-amber-500" : "bg-stone-200"}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 1 && (
            <div>
              <h3 className="font-semibold mb-1">Client</h3>
              <p className="text-sm text-stone-500 mb-5">
                Search existing clients or create a new account. Account is created automatically
                and they get login access to view their bookings.
              </p>

              <div className="relative mb-5">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  placeholder="Search clients by name, email, or phone..."
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="text-xs text-stone-500 tracking-widest mb-2">
                OR CREATE NEW CLIENT
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Full name"
                  value={data.client}
                  onChange={(v) => setData({ ...data, client: v })}
                />
                <Field
                  label="Phone"
                  value={data.phone}
                  onChange={(v) => setData({ ...data, phone: v })}
                />
                <div className="col-span-2">
                  <Field
                    label="Email"
                    value={data.email}
                    onChange={(v) => setData({ ...data, email: v })}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 mt-4 text-sm text-stone-700">
                <input type="checkbox" defaultChecked className="mt-0.5" />
                <span>
                  Send welcome email and create account on kosyachts.com so they can view this
                  booking
                </span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-1">Charter Details</h3>
              <p className="text-sm text-stone-500 mb-5">
                Boat selection auto-populates the owner, default expense, and crew options.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-stone-600 tracking-wider mb-1 block">BOAT</label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm">
                    <option>Select a boat...</option>
                    <option>40ft Schaefer (Owner: M. Volpe)</option>
                    <option>45ft Sea Ray (Owner: Sea Ray LLC)</option>
                    <option>53ft Galeon (Owner: Galeon Holdings)</option>
                    <option>62ft Azimut (Owner: K. Anderson)</option>
                    <option>68ft Azimut Paragon (Owner: P. Tony)</option>
                    <option>88ft Azimut Cloud 9 (Owner: Tony Toscano)</option>
                  </select>
                </div>
                <Field
                  label="Date"
                  value={data.date}
                  onChange={(v) => setData({ ...data, date: v })}
                  type="date"
                />
                <Field
                  label="Start time"
                  value={data.time}
                  onChange={(v) => setData({ ...data, time: v })}
                  type="time"
                />
                <Field
                  label="Duration (hours)"
                  value={data.duration}
                  onChange={(v) => setData({ ...data, duration: v })}
                  type="number"
                />
                <div>
                  <label className="text-xs text-stone-600 tracking-wider mb-1 block">
                    CAPTAIN
                  </label>
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm">
                    <option>Auto-assign</option>
                    <option>Tyler</option>
                    <option>Alex Perez</option>
                    <option>Tony Toscano</option>
                    <option>Kent May</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-stone-600 tracking-wider mb-1 block">
                    INTERNAL NOTES
                  </label>
                  <textarea
                    rows={3}
                    value={data.notes}
                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                    placeholder="Tip splits, special requests, captain notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold mb-1">Pricing & Invoice</h3>
              <p className="text-sm text-stone-500 mb-5">
                This generates the invoice, the contract link, and the Stripe payment link in one
                shot.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Gross (GMV)"
                  value={data.gmv}
                  onChange={(v) => setData({ ...data, gmv: v })}
                  type="number"
                  prefix="$"
                />
                <Field
                  label="Owner expense"
                  value={data.expense}
                  onChange={(v) => setData({ ...data, expense: v })}
                  type="number"
                  prefix="$"
                />
                <div>
                  <label className="text-xs text-stone-600 tracking-wider mb-1 block">SOURCE</label>
                  <select
                    value={data.source}
                    onChange={(e) => setData({ ...data, source: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm"
                  >
                    <option>Direct</option>
                    <option>Broker</option>
                    <option>Referral</option>
                    <option>Boatsetter</option>
                    <option>GetMyBoat</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-600 tracking-wider mb-1 block">
                    SALES AGENT
                  </label>
                  <select
                    value={data.agent}
                    onChange={(e) => setData({ ...data, agent: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm"
                  >
                    <option>LJ (Luke)</option>
                    <option>AP (Alex Perez)</option>
                    <option>BS (Ben Snyder)</option>
                    <option>Angel</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-stone-50 rounded-md border border-stone-200">
                <div className="text-xs text-stone-600 tracking-widest mb-3">INVOICE SUMMARY</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span>Charter total</span>
                    <span>${(Number(data.gmv) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Owner payout</span>
                    <span>(${(Number(data.expense) || 0).toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-stone-200">
                    <span>KOS revenue</span>
                    <span className="text-emerald-700">
                      ${((Number(data.gmv) || 0) - (Number(data.expense) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <span>Email invoice via Stripe payment link</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <span>Send bareboat charter contract for e-signature</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="mt-0.5" />
                  <span>Add to Google Calendar and notify captain</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" />
                  <span>Sync to QuickBooks for accountant</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
          <button onClick={onClose} className="text-sm text-stone-600 hover:text-slate-900">
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-md hover:bg-white"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium bg-amber-500 text-slate-900 rounded-md hover:bg-amber-400 flex items-center gap-2"
              >
                <Send size={14} /> Create & Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="text-xs text-stone-600 tracking-wider mb-1 block">
        {label.toUpperCase()}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${prefix ? "pl-7" : "pl-3"} pr-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm`}
        />
      </div>
    </div>
  );
}

function Clients({ bookings }: { bookings: Booking[] }) {
  const clientMap: Record<string, ClientSummary> = {};
  bookings.forEach((b) => {
    if (!clientMap[b.client])
      clientMap[b.client] = { name: b.client, email: b.email, phone: b.phone, count: 0, total: 0 };
    clientMap[b.client].count++;
    clientMap[b.client].total += b.gmv;
  });
  const clients = Object.values(clientMap).sort((a, b) => b.total - a.total);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-3xl font-semibold tracking-tight"
          >
            Clients
          </h1>
          <p className="text-stone-600 mt-1 text-sm">
            {clients.length} clients · accounts auto-created on first booking
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-stone-200 rounded-md hover:bg-stone-50 bg-white">
          <Plus size={14} /> Add client
        </button>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50">
              <th className="text-left font-medium text-xs text-stone-500 px-6 py-3 tracking-wider">
                CLIENT
              </th>
              <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                CONTACT
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                BOOKINGS
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                LIFETIME VALUE
              </th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={i} className="border-b border-stone-100 hover:bg-stone-50/70 cursor-pointer">
                <td className="px-6 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold">
                    {c.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-stone-500">Account active</div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-stone-600 text-xs">
                  {c.email && <div className="truncate max-w-[220px]">{c.email}</div>}
                  {c.phone && <div>{c.phone}</div>}
                </td>
                <td className="px-4 py-3.5 text-right font-medium">{c.count}</td>
                <td className="px-4 py-3.5 text-right font-semibold">
                  ${c.total.toLocaleString()}
                </td>
                <td className="px-2">
                  <ChevronRight size={16} className="text-stone-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Boats() {
  const boats = [
    { name: "40ft Schaefer", owner: "M. Volpe", bookings: 12, revenue: 14400, status: "active" },
    { name: "45ft Sea Ray", owner: "Sea Ray LLC", bookings: 8, revenue: 11200, status: "active" },
    {
      name: "53ft Galeon",
      owner: "Galeon Holdings",
      bookings: 6,
      revenue: 28000,
      status: "active",
    },
    { name: "62ft Azimut", owner: "K. Anderson", bookings: 4, revenue: 18000, status: "active" },
    {
      name: "68ft Azimut Paragon",
      owner: "P. Tony",
      bookings: 22,
      revenue: 67000,
      status: "active",
    },
    {
      name: "88ft Azimut Cloud 9",
      owner: "Tony Toscano",
      bookings: 9,
      revenue: 92000,
      status: "active",
    },
    {
      name: "27ft Pontoon Tyler",
      owner: "Tyler Holdings",
      bookings: 18,
      revenue: 9800,
      status: "maintenance",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            style={{ fontFamily: "'Fraunces', serif" }}
            className="text-3xl font-semibold tracking-tight"
          >
            Boats & Owners
          </h1>
          <p className="text-stone-600 mt-1 text-sm">{boats.length} vessels under management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800">
          <Plus size={14} /> Add boat
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {boats.map((b, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-stone-200 p-5 hover:border-amber-500/40 transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center">
                <Ship size={18} className="text-amber-500" />
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${b.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
              >
                {b.status}
              </span>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif" }} className="font-semibold text-lg">
              {b.name}
            </div>
            <div className="text-xs text-stone-500 mb-4">Owner: {b.owner}</div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
              <div>
                <div className="text-xs text-stone-500">Bookings</div>
                <div className="font-semibold">{b.bookings}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Revenue</div>
                <div className="font-semibold">${b.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Agents({ bookings }: { bookings: Booking[] }) {
  const agentMap: Record<string, AgentAgg> = {};
  bookings.forEach((b) => {
    if (!agentMap[b.agent]) agentMap[b.agent] = { code: b.agent, count: 0, gmv: 0, commission: 0 };
    agentMap[b.agent].count++;
    agentMap[b.agent].gmv += b.gmv;
    agentMap[b.agent].commission += b.commission;
  });
  const agents = Object.values(agentMap).sort((a, b) => b.commission - a.commission);
  const names: Record<string, string> = {
    LJ: "Luke Jordan",
    AP: "Alex Perez",
    BS: "Ben Snyder",
    Angel: "Angel",
    BG: "Ben Gindhart",
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-3xl font-semibold tracking-tight"
        >
          Agents & Commissions
        </h1>
        <p className="text-stone-600 mt-1 text-sm">
          Tracked per booking. Auto-calculated based on agent rate.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50">
              <th className="text-left font-medium text-xs text-stone-500 px-6 py-3 tracking-wider">
                AGENT
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                BOOKINGS
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                GMV BOOKED
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                COMMISSION OWED
              </th>
              <th className="px-2"></th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, i) => (
              <tr key={i} className="border-b border-stone-100 hover:bg-stone-50/70">
                <td className="px-6 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-semibold text-xs">
                    {a.code}
                  </div>
                  <div>
                    <div className="font-medium">{names[a.code] || a.code}</div>
                    <div className="text-xs text-stone-500">Active</div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-medium">{a.count}</td>
                <td className="px-4 py-3.5 text-right">${a.gmv.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-amber-700">
                  ${a.commission.toLocaleString()}
                </td>
                <td className="px-2">
                  <ChevronRight size={16} className="text-stone-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Invoicing({ bookings }: { bookings: Booking[] }) {
  const unpaid = bookings.filter((b) => !b.paid);
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1
          style={{ fontFamily: "'Fraunces', serif" }}
          className="text-3xl font-semibold tracking-tight"
        >
          Invoicing
        </h1>
        <p className="text-stone-600 mt-1 text-sm">
          Replaces QuickBooks. Stripe payment links and contracts attached automatically.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard
          label="Outstanding"
          value={`$${unpaid.reduce((s, b) => s + (b.gmv - b.clientPaid), 0).toLocaleString()}`}
          change={`${unpaid.length} invoices`}
        />
        <KPICard
          label="Paid This Month"
          value={`$${bookings
            .filter((b) => b.paid)
            .reduce((s, b) => s + b.clientPaid, 0)
            .toLocaleString()}`}
          change="+24%"
          trend="up"
          accent
        />
        <KPICard label="Owner Payouts Due" value="$8,420" change="6 owners" />
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 font-semibold">Open Invoices</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50">
              <th className="text-left font-medium text-xs text-stone-500 px-6 py-3 tracking-wider">
                INVOICE #
              </th>
              <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                CLIENT
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                AMOUNT
              </th>
              <th className="text-right font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                DUE
              </th>
              <th className="text-left font-medium text-xs text-stone-500 px-4 py-3 tracking-wider">
                STATUS
              </th>
              <th className="px-4"></th>
            </tr>
          </thead>
          <tbody>
            {unpaid.map((b) => (
              <tr key={b.id} className="border-b border-stone-100 hover:bg-stone-50/70">
                <td className="px-6 py-3.5 font-mono text-xs">INV-{b.id}</td>
                <td className="px-4 py-3.5 font-medium">{b.client}</td>
                <td className="px-4 py-3.5 text-right font-semibold">
                  ${(b.gmv - b.clientPaid).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right text-stone-600">{b.date}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status="pending" />
                </td>
                <td className="px-4 py-3.5">
                  <button className="text-xs px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-800">
                    Send reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="p-8 max-w-3xl">
      <h1
        style={{ fontFamily: "'Fraunces', serif" }}
        className="text-3xl font-semibold tracking-tight mb-6"
      >
        Settings
      </h1>
      <div className="space-y-4">
        {[
          {
            title: "Integrations",
            desc: "Stripe, Twilio, QuickBooks export, Google Calendar, GoHighLevel",
          },
          {
            title: "Email Templates",
            desc: "Pre-trip pack, post-trip thank you, review request, follow up sequences",
          },
          {
            title: "Contract Templates",
            desc: "Bareboat charter agreement, captain agreement, owner agreement",
          },
          {
            title: "Commission Rules",
            desc: "Per-agent rates, per-source overrides, owner splits",
          },
          {
            title: "Tax & Sales Tax",
            desc: "FL sales tax, multi-state config, certificate uploads",
          },
          { title: "Team & Permissions", desc: "User roles, captain access, broker access" },
        ].map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-lg border border-stone-200 p-5 flex items-center justify-between hover:border-amber-500/40 cursor-pointer"
          >
            <div>
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-stone-500 mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
