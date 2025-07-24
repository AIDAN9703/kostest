"use client";

import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/shared/utils/general-utils";

interface QuoteFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  boatName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPassengers: number;
  location: string;
  specialRequests: string;
  basePrice: number;
  captainFee: number;
  cleaningFee: number;
  serviceFee: number;
  taxRate: number;
  includesCaptain: boolean;
  includesFuel: boolean;
  includesInsurance: boolean;
  notes: string;
}

const mockBoats = [
  "Ocean Explorer",
  "Royal Voyager", 
  "Paradise Cruiser",
  "Coastal Dream",
  "Sea Breeze"
];

export default function CreateQuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuoteFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    boatName: "",
    date: "",
    startTime: "10:00",
    endTime: "18:00",
    numberOfPassengers: 1,
    location: "",
    specialRequests: "",
    basePrice: 1000,
    captainFee: 150,
    cleaningFee: 50,
    serviceFee: 50,
    taxRate: 8.5,
    includesCaptain: true,
    includesFuel: false,
    includesInsurance: true,
    notes: "",
  });

  const handleInputChange = (field: keyof QuoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate pricing
  const subtotal = formData.basePrice + 
    (formData.includesCaptain ? formData.captainFee : 0) + 
    formData.cleaningFee + 
    formData.serviceFee;
  
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  const depositAmount = totalAmount * 0.15; // 15% deposit

  const generateQuoteId = () => {
    return `Q${Date.now().toString(36).toUpperCase()}`;
  };

  const createQuoteData = () => ({
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    customerPhone: formData.customerPhone,
    boatName: formData.boatName,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    numberOfPassengers: formData.numberOfPassengers,
    location: formData.location,
    specialRequests: formData.specialRequests,
    includesCaptain: formData.includesCaptain,
    includesFuel: formData.includesFuel,
    includesInsurance: formData.includesInsurance,
    basePrice: formData.basePrice,
    captainFee: formData.captainFee,
    cleaningFee: formData.cleaningFee,
    serviceFee: formData.serviceFee,
    taxAmount,
    totalAmount,
    depositAmount,
    notes: formData.notes,
  });

  const handleSaveAndDownload = async () => {
    try {
      const quoteData = createQuoteData();
      
      // Create quote via API
      const response = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote');
      }

      const result = await response.json();
      
      // Automatically download the PDF
      const pdfResponse = await fetch(`/api/quotes/${result.quote.id}/pdf`);
      
      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Convert response to blob and download
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${result.quote.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Navigate back to quotes page
      router.push("/admin/quotes");
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Failed to create quote. Please try again.");
    }
  };

  const isFormValid = formData.customerName && formData.customerEmail && formData.boatName && formData.date;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Quote</h1>
            <p className="text-gray-500 mt-1">
              Generate a custom quote for a boat rental
            </p>
          </div>
        </div>

      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Customer's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Boat & Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="boat">Select Boat *</Label>
                <Select value={formData.boatName} onValueChange={(value) => handleInputChange("boatName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a boat" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBoats.map(boat => (
                      <SelectItem key={boat} value={boat}>
                        {boat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="numberOfPassengers">Number of Passengers</Label>
                  <Input
                    id="numberOfPassengers"
                    type="number"
                    min="1"
                    value={formData.numberOfPassengers}
                    onChange={(e) => handleInputChange("numberOfPassengers", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Pickup Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Miami Beach Marina"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Inclusions</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includesCaptain"
                    checked={formData.includesCaptain}
                    onCheckedChange={(checked) => handleInputChange("includesCaptain", checked)}
                  />
                  <Label htmlFor="includesCaptain">Captain Included</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includesFuel"
                    checked={formData.includesFuel}
                    onCheckedChange={(checked) => handleInputChange("includesFuel", checked)}
                  />
                  <Label htmlFor="includesFuel">Fuel Included</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includesInsurance"
                    checked={formData.includesInsurance}
                    onCheckedChange={(checked) => handleInputChange("includesInsurance", checked)}
                  />
                  <Label htmlFor="includesInsurance">Insurance Included</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="captainFee">Captain Fee ($)</Label>
                  <Input
                    id="captainFee"
                    type="number"
                    step="0.01"
                    value={formData.captainFee}
                    onChange={(e) => handleInputChange("captainFee", parseFloat(e.target.value) || 0)}
                    disabled={!formData.includesCaptain}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee ($)</Label>
                  <Input
                    id="cleaningFee"
                    type="number"
                    step="0.01"
                    value={formData.cleaningFee}
                    onChange={(e) => handleInputChange("cleaningFee", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="serviceFee">Service Fee ($)</Label>
                  <Input
                    id="serviceFee"
                    type="number"
                    step="0.01"
                    value={formData.serviceFee}
                    onChange={(e) => handleInputChange("serviceFee", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange("taxRate", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any internal notes about this quote..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Price:</span>
                  <span>{formatCurrency(formData.basePrice)}</span>
                </div>
                {formData.includesCaptain && (
                  <div className="flex justify-between text-sm">
                    <span>Captain Fee:</span>
                    <span>{formatCurrency(formData.captainFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Cleaning Fee:</span>
                  <span>{formatCurrency(formData.cleaningFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee:</span>
                  <span>{formatCurrency(formData.serviceFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Deposit (15%):</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSaveAndDownload}
                  className="w-full"
                  disabled={!isFormValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 