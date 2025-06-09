import baseApi from "./baseApi";
import { 
  ticketDetailsSchema, 
  paginatedTicketsSchema, 
  refundRequestSchema,
  PaginatedTickets,
  TicketDetails,
  QrCode,
  RefundRequest
} from "@/schemas/ticket";
import * as base64 from 'base64-js';

/**
 * Fetch user tickets with pagination
 * @param userId User ID
 * @param type Ticket type (0 for current, 1 for archive)
 * @param pageNumber Page number (0-based, will be adjusted to 1-based for the API)
 * @param pageSize Number of items per page
 * @returns Paginated tickets
 */
const getUserTickets = async (
  userId: string,
  type: number,
  pageNumber: number,
  pageSize: number
): Promise<PaginatedTickets> => {
  try {
    // Ensure pageNumber is at least 1 for the API
    const adjustedPageNumber = pageNumber + 1;

    const res = await baseApi.get(`/tickets/${userId}`, {
      params: {
        type,
        pageNumber: adjustedPageNumber,
        pageSize
      }
    });

    const validation = paginatedTicketsSchema.safeParse(res.data);

    if (!validation.success) {
      console.error(validation.error);
      throw new Error("Invalid tickets data");
    }

    // Adjust pageNumber in the response to maintain 0-based consistency with client code
    const data = validation.data;
    if (data.pageNumber > 0) {
      data.pageNumber -= 1;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    throw error;
  }
};

/**
 * Get ticket details
 * @param ticketId Ticket ID
 * @returns Ticket details
 */
const getTicketDetails = async (ticketId: string): Promise<TicketDetails> => {
  try {
    const res = await baseApi.get(`/tickets/${ticketId}/details`);
    const validation = ticketDetailsSchema.safeParse(res.data);

    if (!validation.success) {
      console.error(validation.error);
      throw new Error("Invalid ticket details data");
    }

    return validation.data;
  } catch (error) {
    console.error("Failed to fetch ticket details:", error);
    throw error;
  }
};

/**
 * Get QR code for a ticket
 * @param qrCodeId QR code ID
 * @returns Base64 encoded image string
 */
const getQrCode = async (qrCodeId: string): Promise<QrCode> => {
  try {
    // Request the QR code as a binary blob
    const res = await baseApi.get(`/tickets/qr-code/${qrCodeId}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/png',
      },
    });

    // Convert the binary data to a base64 string using base64-js
    const uint8Array = new Uint8Array(res.data);
    const base64String = base64.fromByteArray(uint8Array);
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error("Failed to fetch QR code:", error);
    throw error;
  }
};

/**
 * Cancel a ticket
 * @param ticketId Ticket ID
 */
const cancelTicket = async (ticketId: string): Promise<void> => {
  try {
    await baseApi.post(`/tickets/${ticketId}/cancel`);
  } catch (error) {
    console.error("Failed to cancel ticket:", error);
    throw error;
  }
};

/**
 * Request a refund for a ticket
 * @param refundRequest Refund request data
 * @param ticketStatus Optional ticket status, if provided will check if refund is allowed
 */
const requestRefund = async (refundRequest: RefundRequest, ticketStatus?: string): Promise<void> => {
  try {
    // Check if ticket status is provided and is not PAID
    if (ticketStatus && ticketStatus !== "PAID") {
      console.error(`Cannot request refund for ticket with status: ${ticketStatus}`);
      throw new Error(`Refund is only available for PAID tickets, current status: ${ticketStatus}`);
    }

    const validation = refundRequestSchema.safeParse(refundRequest);

    if (!validation.success) {
      console.error(validation.error);
      throw new Error("Invalid refund request data");
    }

    // Log the request data for debugging
    console.log("Refund request data:", JSON.stringify(refundRequest));

    // Create a modified request with the email field in a different format
    // Try with both camelCase and snake_case variations
    const modifiedRequest = {
      ...refundRequest,
      // Add additional fields or format changes here if needed
      userEmail: refundRequest.email, // Try alternative field name
      user_email: refundRequest.email, // Try snake_case variation
      emailAddress: refundRequest.email, // Try another alternative
      email_address: refundRequest.email, // Try snake_case variation
    };

    console.log("Modified refund request data:", JSON.stringify(modifiedRequest));

    try {
      // Try the original endpoint with POST method first
      try {
        const response = await baseApi.post("/tickets/refund-request", modifiedRequest);
        console.log("Refund request successful (POST):", response.status, response.statusText);
        return; // Exit if successful
      } catch (originalError: any) {
        console.error("Original POST request error:", originalError.message);
        if (originalError.response) {
          console.error("Response status:", originalError.response.status);
          console.error("Response data:", JSON.stringify(originalError.response.data));
        }

        // If the original request fails, try with the original data
        try {
          console.log("Trying with original request data...");
          const originalResponse = await baseApi.post("/tickets/refund-request", refundRequest);
          console.log("Refund request successful (original data):", originalResponse.status, originalResponse.statusText);
          return; // Exit if successful
        } catch (originalDataError: any) {
          console.error("Original data request error:", originalDataError.message);
          if (originalDataError.response) {
            console.error("Response status:", originalDataError.response.status);
            console.error("Response data:", JSON.stringify(originalDataError.response.data));
          }
        }

        // Try a simplified request with just the essential fields
        try {
          console.log("Trying with simplified request data...");
          const simplifiedRequest = {
            userId: refundRequest.userId,
            ticketId: refundRequest.ticketId,
            reason: refundRequest.reason,
            email: refundRequest.email
          };
          const simplifiedResponse = await baseApi.post("/tickets/refund-request", simplifiedRequest);
          console.log("Refund request successful (simplified data):", simplifiedResponse.status, simplifiedResponse.statusText);
          return; // Exit if successful
        } catch (simplifiedError: any) {
          console.error("Simplified request error:", simplifiedError.message);
          if (simplifiedError.response) {
            console.error("Response status:", simplifiedError.response.status);
            console.error("Response data:", JSON.stringify(simplifiedError.response.data));
          }
        }

        // If all POST attempts fail, try PUT method
        try {
          console.log("Trying PUT method...");
          const putResponse = await baseApi.put("/tickets/refund-request", modifiedRequest);
          console.log("Refund request successful (PUT):", putResponse.status, putResponse.statusText);
          return; // Exit if successful
        } catch (putError: any) {
          console.error("PUT request error:", putError.message);
          if (putError.response) {
            console.error("Response status:", putError.response.status);
            console.error("Response data:", JSON.stringify(putError.response.data));
          }
        }

        // If we get here, all attempts failed
        throw originalError; // Throw the original error
      }
    } catch (apiError: any) {
      console.error("All refund request attempts failed:", apiError.message);
      throw apiError;
    }
  } catch (error) {
    console.error("Failed to request refund:", error);
    throw error;
  }
};

// Ticket API functions
const ticketApi = {
  getUserTickets,
  getTicketDetails,
  getQrCode,
  cancelTicket,
  requestRefund,

  // Get current ticket ID (from original api.ts)
  getCurrentTicket: async () => {
    try {
      const response = await baseApi.get<string>('/tickets/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ticketApi;
