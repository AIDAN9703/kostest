import { Package, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

export function StripeInstructions() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Stripe Product + Prices Setup
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              For each event, create one Stripe Product with multiple Prices:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Go to Stripe Dashboard → Products → Create Product</li>
              <li>Name it after your event (e.g. "Sunset Yacht Party - March 15th")</li>
              <li>Add multiple Prices for ticket tiers (General $50, VIP $80, etc.)</li>
              <li>Copy the Product ID and all Price IDs into this form</li>
            </ol>
            <a 
              href="https://dashboard.stripe.com/products" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mt-2"
            >
              Go to Stripe Products <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
