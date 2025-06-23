import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '@/lib/pdf/QuotePDF';
import { quotesStorage } from '@/lib/utils/quote-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quoteId = resolvedParams.id;
    console.log('PDF route called for quote ID:', quoteId);
    console.log('Storage size:', quotesStorage.size());
    console.log('Storage keys:', quotesStorage.keys());

    // Get the actual quote data from storage
    const quoteData = quotesStorage.get(quoteId);
    console.log('Found quote data:', quoteData ? 'Yes' : 'No');
    
    if (!quoteData) {
      console.log('Quote not found in storage');
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    console.log('Generating PDF for quote:', quoteData.id);
    // Generate PDF
    const doc = QuotePDF({ quote: quoteData });
    const pdfBlob = await pdf(doc).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 