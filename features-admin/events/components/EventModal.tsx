import { useState, useEffect } from "react";
import { Calendar, Clock, CreditCard, Package, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface EventModalProps {
  event: any;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
}

// Helper function to initialize form data (DRY principle)
const initializeFormData = (eventData: any) => ({
  title: eventData?.title || "",
  slug: eventData?.slug || "",
  description: eventData?.description || "",
  eventDate: eventData?.eventDate ? new Date(eventData.eventDate).toISOString().slice(0, 10) : "",
  startTime: eventData?.startTime ? new Date(eventData.startTime).toTimeString().slice(0, 5) : "",
  endTime: eventData?.endTime ? new Date(eventData.endTime).toTimeString().slice(0, 5) : "",
  location: eventData?.location || "",
  yachtName: eventData?.yachtName || "",
  totalCapacity: eventData?.totalCapacity || 50,
  isActive: eventData?.isActive ?? false,
  stripeProductId: eventData?.stripeProductId || "",
});

const getDefaultTicketTiers = () => [
  { name: "General", price: "50.00", maxQuantity: 30, sortOrder: 0, stripePriceId: "", isActive: true },
  { name: "VIP", price: "80.00", maxQuantity: 20, sortOrder: 1, stripePriceId: "", isActive: true }
];

export function EventModal({ event, isOpen, loading, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState(() => initializeFormData(event));
  const [ticketTiers, setTicketTiers] = useState(() => event?.ticketTiers || getDefaultTicketTiers());

  // Only update when event prop changes, not duplicate initialization
  useEffect(() => {
    setFormData(initializeFormData(event));
    setTicketTiers(event?.ticketTiers || getDefaultTicketTiers());
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      ticketTiers: ticketTiers.filter((tier: any) => tier.name && tier.price)
    });
  };

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, {
      name: "",
      price: "0.00",
      maxQuantity: 10,
      sortOrder: ticketTiers.length,
      stripePriceId: "",
      isActive: true
    }]);
  };

  const updateTicketTier = (index: number, field: string, value: string | number | boolean) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const removeTicketTier = (index: number) => {
    setTicketTiers(ticketTiers.filter((_: any, i: number) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Plus className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (for URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Schedule
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time (Optional)</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Location & Capacity */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="yachtName">Yacht Name</Label>
                  <Input
                    id="yachtName"
                    value={formData.yachtName}
                    onChange={(e) => setFormData({ ...formData, yachtName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="totalCapacity">Total Capacity</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Stripe Product */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Stripe Product Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="stripeProductId">Stripe Product ID</Label>
                  <Input
                    id="stripeProductId"
                    placeholder="prod_1234567890abcdef"
                    value={formData.stripeProductId}
                    onChange={(e) => setFormData({ ...formData, stripeProductId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get this from your Stripe dashboard → Products → [Your Event Product]
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Tiers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ticket Tiers</h3>
                <Button type="button" onClick={addTicketTier} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {ticketTiers.map((tier: any, index: number) => (
                  <Card key={index} className="border-muted">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Tier {index + 1}</CardTitle>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeTicketTier(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={tier.name}
                            onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                            placeholder="General, VIP, etc."
                          />
                        </div>
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.price}
                            onChange={(e) => updateTicketTier(index, 'price', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Max Quantity</Label>
                          <Input
                            type="number"
                            value={tier.maxQuantity}
                            onChange={(e) => updateTicketTier(index, 'maxQuantity', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Sort Order</Label>
                          <Input
                            type="number"
                            value={tier.sortOrder || index}
                            onChange={(e) => updateTicketTier(index, 'sortOrder', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Stripe Price ID</Label>
                        <Input
                          placeholder="price_1234567890abcdef"
                          value={tier.stripePriceId || ""}
                          onChange={(e) => updateTicketTier(index, 'stripePriceId', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Add a Price to your Stripe Product for ${tier.price} and paste the ID here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Make this event active (visible to customers)</Label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {event ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  event ? "Update Event" : "Create Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
