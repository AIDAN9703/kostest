/**
 * Twilio API client
 * - Verify API: OTP verification codes
 * - Messages API: SMS (e.g. draft booking links)
 */

import { formatPhoneNumberE164 } from '../utils/general-utils';

/**
 * Send an SMS message (Twilio Messages API)
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
export async function sendSms(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio SMS not configured (missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER)');
      return { success: false, error: 'SMS not configured' };
    }

    const formattedTo = formatPhoneNumberE164(to);
    if (!formattedTo) {
      return { success: false, error: 'Invalid phone number' };
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: body,
        }).toString(),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return { success: true };
    }
    console.error('Twilio SMS error:', data);
    return { success: false, error: data.message || 'Failed to send SMS' };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
}

/**
 * Sends a verification code to the provided phone number
 * 
 * @param phoneNumber - The phone number to send the verification code to
 * @param channel - The channel to use for verification (sms, call, email, whatsapp)
 * @returns A promise that resolves to the Twilio API response
 */
export const sendVerification = async (
  phoneNumber: string,
  channel: 'sms' | 'call' | 'email' | 'whatsapp' = 'sms'
): Promise<{ success: boolean; error?: string; sid?: string }> => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Create Basic Auth header
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        'To': formattedPhoneNumber,
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

/**
 * Checks a verification code against the code sent to the provided phone number
 * 
 * @param phoneNumber - The phone number the verification code was sent to
 * @param code - The verification code to check
 * @returns A promise that resolves to the Twilio API response
 */
export const checkVerification = async (
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; status?: string; error?: string }> => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Create Basic Auth header
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        'To': formattedPhoneNumber,
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