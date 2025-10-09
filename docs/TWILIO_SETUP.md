# Twilio Verification Setup

This document outlines how to set up and use Twilio Verify for phone verification in the KOSyachts application.

## Prerequisites

1. A Twilio account with:
   - Account SID
   - Auth Token
   - Verify Service SID (create one in the Twilio Console)

2. Environment variables set up in `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

## Implementation Details

The application uses Twilio's Verify API directly to handle phone verification:

### 1. Sending Verification Codes

When a user signs up or requests a verification code, the application calls Twilio's Verify API to send a verification code to the user's phone number:

```typescript
// lib/twilio.ts
export const sendVerification = async (
  phoneNumber: string,
  channel: 'sms' | 'call' | 'email' | 'whatsapp' = 'sms'
): Promise<{ success: boolean; error?: string; sid?: string }> => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Create Basic Auth header
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        'To': phoneNumber,
        'Channel': channel
      }).toString()
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        sid: data.sid
      };
    } else {
      console.error('Twilio API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send verification code'
      };
    }
  } catch (error) {
    console.error('Error sending verification:', error);
    return {
      success: false,
      error: 'Failed to send verification code'
    };
  }
};
```

### 2. Checking Verification Codes

When a user enters a verification code, the application calls Twilio's Verify API to check if the code is valid:

```typescript
// lib/twilio.ts
export const checkVerification = async (
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; status?: string; error?: string }> => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Create Basic Auth header
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        'To': phoneNumber,
        'Code': code
      }).toString()
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: data.status === 'approved',
        status: data.status
      };
    } else {
      console.error('Twilio API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to check verification code'
      };
    }
  } catch (error) {
    console.error('Error checking verification:', error);
    return {
      success: false,
      error: 'Failed to check verification code'
    };
  }
};
```

## Verification Flow

1. User signs up with a phone number
2. The application sends a verification code to the user's phone via Twilio Verify API
3. User enters the verification code on the verify page
4. The application verifies the code with Twilio Verify API
5. If successful, the user's phone is marked as verified

## Webhook Integration

The application also includes a webhook endpoint that Twilio can call to update verification statuses:

```
/api/twilio/webhook
```

To set up the webhook:

1. Go to the [Twilio Console](https://www.twilio.com/console/verify/services)
2. Select your Verify Service
3. Go to Webhooks
4. Add a new webhook for verification status updates
5. Set the URL to your application's webhook endpoint
6. Save the webhook configuration

## Testing

To test the verification flow:

1. Sign up with a valid phone number
2. You should be redirected to the verify page
3. Enter the verification code sent to your phone
4. You should be redirected to the home page with your phone marked as verified

For development, you can use Twilio's test credentials and phone numbers.

## Twilio Verify API Documentation

For more information on Twilio's Verify API, see the [official documentation](https://www.twilio.com/docs/verify/api). 