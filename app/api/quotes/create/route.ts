import { NextRequest, NextResponse } from 'next/server';
import { quotesStorage } from '@/shared/utils/quote-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating quote with data:', body);
    
    // Generate quote ID
    const quoteId = `Q${Date.now().toString(36).toUpperCase()}`;
    console.log('Generated quote ID:', quoteId);
    
    const quoteData = {
      id: quoteId,
      customer: {
        name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone,
      },
      boat: {
        name: body.boatName,
      },
      details: {
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        numberOfPassengers: body.numberOfPassengers,
        location: body.location,
        specialRequests: body.specialRequests,
        includesCaptain: body.includesCaptain,
        includesFuel: body.includesFuel,
        includesInsurance: body.includesInsurance,
      },
      pricing: {
        basePrice: body.basePrice,
        captainFee: body.includesCaptain ? body.captainFee : 0,
        cleaningFee: body.cleaningFee,
        serviceFee: body.serviceFee,
        taxAmount: body.taxAmount,
        totalAmount: body.totalAmount,
        depositAmount: body.depositAmount,
      },
      dates: {
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      notes: body.notes,
    };

    // Store in filesystem for PDF generation
    quotesStorage.set(quoteId, quoteData);
    console.log('Stored quote in storage, storage size:', quotesStorage.size());
    
    return NextResponse.json({ 
      success: true, 
      quote: quoteData,
      pdfUrl: `/api/quotes/${quoteId}/pdf`
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
} 