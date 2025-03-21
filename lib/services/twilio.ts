/**
 * Twilio Verify API client
 * 
 * This file contains utility functions for interacting with Twilio's Verify API directly.
 * It provides a simple interface for sending and checking verification codes.
 */

import { formatPhoneNumberE164 } from '../utils';

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