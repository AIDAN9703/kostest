/**
 * GoHighLevel Webhook Integration Service
 * Simple, centralized service for sending data to different GHL workflows
 */

export interface GHLWebhookData {
  name: string;
  email: string;
  phone: string;
  [key: string]: any; // Allow additional fields
}

class GHLWebhookService {
  private readonly baseUrl = 'https://services.leadconnectorhq.com/hooks/uk2U6vqDpNjnOPwiTM8g/webhook-trigger';
  
  // Different webhook endpoints for different workflows
  private readonly webhookEndpoints = {
    inquiry: 'a807016d-cf25-4284-8d83-b7fb0129fa68', // Your existing inquiry webhook
    instantBooking: 'KUjCPRCtj1FACCVb150m', // New instant booking webhook
    bookingRequest: 'TBD', // Will add when you get the endpoint
  };

  /**
   * Send instant booking data to GHL
   */
  async sendInstantBooking(data: GHLWebhookData): Promise<boolean> {
    try {
      const webhookUrl = `${this.baseUrl}/${this.webhookEndpoints.instantBooking}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.warn('GHL instant booking webhook failed:', response.status, response.statusText);
        return false;
      }

      console.log('GHL instant booking webhook sent successfully');
      return true;
    } catch (error) {
      console.warn('GHL instant booking webhook error:', error);
      return false;
    }
  }

  /**
   * Send inquiry data to GHL (existing functionality)
   */
  async sendInquiry(data: GHLWebhookData): Promise<boolean> {
    try {
      const webhookUrl = `${this.baseUrl}/${this.webhookEndpoints.inquiry}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.warn('GHL inquiry webhook failed:', response.status, response.statusText);
        return false;
      }

      console.log('GHL inquiry webhook sent successfully');
      return true;
    } catch (error) {
      console.warn('GHL inquiry webhook error:', error);
      return false;
    }
  }

  /**
   * Send booking request data to GHL (when you get the endpoint)
   */
  async sendBookingRequest(data: GHLWebhookData): Promise<boolean> {
    // TODO: Add endpoint when you get it
    console.log('Booking request webhook not configured yet');
    return false;
  }
}

// Export singleton instance
export const ghlWebhookService = new GHLWebhookService();
