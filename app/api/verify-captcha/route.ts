import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  const { token } = data;
  
  // Get your secret key from environment variables
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Test secret key
  
  try {
    // Verify the captcha token with Google's API
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error verifying CAPTCHA' },
      { status: 500 }
    );
  }
} 