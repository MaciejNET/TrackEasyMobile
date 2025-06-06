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
 */
const requestRefund = async (refundRequest: RefundRequest): Promise<void> => {
  try {
    const validation = refundRequestSchema.safeParse(refundRequest);

    if (!validation.success) {
      console.error(validation.error);
      throw new Error("Invalid refund request data");
    }

    await baseApi.post("/tickets/refund-request", refundRequest);
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
