import { Metadata } from "next";
import {
  CreditCard,
  DollarSign,
  DownloadCloud,
  ExternalLink,
  Filter,
  HelpCircle,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/lib/utils/general-utils";

export const metadata: Metadata = {
  title: "Stripe Integration | Admin Dashboard",
  description: "Manage Stripe payments and settings",
};

// Mock data
const transactions = [
  {
    id: "pi_3Nz5RtCtXPgHUvSj1QsPdlAx",
    customer: "John Smith",
    amount: 1250,
    status: "succeeded",
    date: "2023-08-15T10:30:00Z",
    description: "Booking #B12345",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "pi_3Nz4MhCtXPgHUvSj0AXKlF9n",
    customer: "Jane Cooper",
    amount: 1850,
    status: "succeeded",
    date: "2023-08-14T14:20:00Z",
    description: "Booking #B12346",
    paymentMethod: "Mastercard •••• 5555",
  },
  {
    id: "pi_3Nz1PjCtXPgHUvSj0LbmUj7K",
    customer: "Michael Johnson",
    amount: 3200,
    status: "succeeded",
    date: "2023-08-12T09:45:00Z",
    description: "Booking #B12347",
    paymentMethod: "American Express •••• 3782",
  },
  {
    id: "pi_3NyxRqCtXPgHUvSj1BhM2Cxd",
    customer: "Emily Davis",
    amount: 1500,
    status: "refunded",
    date: "2023-08-10T16:15:00Z",
    description: "Booking #B12348 (Refunded)",
    paymentMethod: "Visa •••• 9424",
  },
  {
    id: "pi_3NyrStCtXPgHUvSj0Sn9Kfdl",
    customer: "Robert Wilson",
    amount: 2100,
    status: "failed",
    date: "2023-08-08T11:30:00Z",
    description: "Failed payment attempt",
    paymentMethod: "Mastercard •••• 7890",
  },
];

// Mock payouts data
const payouts = [
  {
    id: "po_1Nz5RtLkJHs73mHK1QsPdlAx",
    amount: 4500,
    status: "paid",
    date: "2023-08-15T10:30:00Z",
    destination: "Bank account ending in 1234",
  },
  {
    id: "po_1Nz4MhLkJHs73mHK0AXKlF9n",
    amount: 3200,
    status: "in_transit",
    date: "2023-08-14T14:20:00Z",
    destination: "Bank account ending in 1234",
  },
  {
    id: "po_1Nz1PjLkJHs73mHK0LbmUj7K",
    amount: 2800,
    status: "paid",
    date: "2023-08-12T09:45:00Z",
    destination: "Bank account ending in 1234",
  },
  {
    id: "po_1NyxRqLkJHs73mHK1BhM2Cxd",
    amount: 5100,
    status: "paid",
    date: "2023-08-10T16:15:00Z",
    destination: "Bank account ending in 1234",
  },
];

export default function StripePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stripe Integration
          </h1>
          <p className="text-gray-500 mt-1">
            Manage payments, payouts, and Stripe settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe Dashboard
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Balance
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(15750)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex">
              <Button size="sm" className="text-xs">
                Transfer to Bank
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Payments
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(3200)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex">
              <Button size="sm" variant="outline" className="text-xs">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Available for Payout
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(12550)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DownloadCloud className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex">
              <Button size="sm" variant="outline" className="text-xs">
                Schedule Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Integration Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search transactions..."
                      className="w-full sm:w-[200px] pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id}
                      </TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-2 text-gray-400" />
                          {transaction.paymentMethod}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing <strong>5</strong> of <strong>127</strong>{" "}
                  transactions
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">Recent Payouts</CardTitle>
                <Button>Schedule Payout</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Destination</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-xs">
                        {payout.id}
                      </TableCell>
                      <TableCell>{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>
                        <PayoutStatusBadge status={payout.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(payout.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payout.destination}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing <strong>4</strong> of <strong>42</strong> payouts
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Account Settings</CardTitle>
              <CardDescription>
                Configure your Stripe integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Stripe Environment</h3>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    Live
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Connected to Stripe Live API
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">API Keys</h3>
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Publishable Key</p>
                      <p className="font-mono text-xs text-gray-500">
                        pk_live_•••••••••••••••••••••••••••
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Show
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Secret Key</p>
                      <p className="font-mono text-xs text-gray-500">
                        sk_live_•••••••••••••••••••••••••••
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Show
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Webhook Settings</h3>
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Webhook URL</p>
                      <p className="font-mono text-xs text-gray-500">
                        https://kos-yachts.com/api/stripe/webhook
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Webhook Secret</p>
                      <p className="font-mono text-xs text-gray-500">
                        whsec_•••••••••••••••••••••••••••
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Show
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Need help setting up Stripe? View our documentation.
                  </span>
                </div>
                <Button>Update Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "succeeded":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Succeeded
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Failed
        </Badge>
      );
    case "refunded":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Refunded
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function PayoutStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Paid
        </Badge>
      );
    case "in_transit":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          In Transit
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Failed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
