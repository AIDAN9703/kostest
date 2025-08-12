'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';
import { createBoatInquiry } from '@/features/messaging/actions/conversations';

type Props = {
  boatId: string;
  defaults?: Partial<Record<'guests' | 'date' | 'time' | 'budget' | 'occasion', string>>;
};

export default function BoatInquiryForm({ boatId, defaults = {} }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [guests, setGuests] = useState(defaults.guests ?? '');
  const [date, setDate] = useState(defaults.date ?? '');
  const [time, setTime] = useState(defaults.time ?? '');
  const [budget, setBudget] = useState(defaults.budget ?? '');
  const [occasion, setOccasion] = useState(defaults.occasion ?? '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = message.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }
    if (!message.trim()) {
      toast({ title: 'Please add a brief message', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const result = await createBoatInquiry(boatId, {
      message: message.trim(),
      guests: guests ? parseInt(guests) : undefined,
      date: date || undefined,
      time: time || undefined,
      budget: budget || undefined,
      occasion: occasion || undefined,
      specialRequests: specialRequests || undefined,
    });
    setSubmitting(false);

    if (result.success) {
      toast({ title: 'Inquiry sent', description: 'We opened a message thread for your request.' });
      router.replace(`/messages/${result.data.conversationId}`);
    } else {
      if (result.errorCode === 'UNAUTHORIZED_ACCESS') {
        router.push('/sign-in');
        return;
      }
      toast({ title: 'Failed to send inquiry', description: result.error || 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I’m interested in a sunset cruise for a birthday..." className="bg-white/70" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="guests">Guests</Label>
          <Input id="guests" type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="8" className="bg-white/70" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input id="budget" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="1500" className="bg-white/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Preferred date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/70" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">Preferred time</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="occasion">Occasion (optional)</Label>
          <Input id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Birthday, proposal, corporate outing..." className="bg-white/70" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="requests">Special requests (optional)</Label>
          <Textarea id="requests" rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Decorations, route, dietary preferences, etc." className="bg-white/70" />
        </div>
      </div>

      <div>
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white">
          {submitting ? 'Sending…' : 'Send Inquiry'}
        </Button>
      </div>
    </div>
  );
}


