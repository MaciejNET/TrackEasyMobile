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
const getUserTickets = async (
  userId: string,
  type: number,
  pageNumber: number,
  pageSize: number
): Promise<PaginatedTickets> => {
  try {
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
const getQrCode = async (qrCodeId: string): Promise<QrCode> => {
  try {
    const res = await baseApi.get(`/tickets/qr-code/${qrCodeId}`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/png',
      },
    });

    const uint8Array = new Uint8Array(res.data);
    const base64String = base64.fromByteArray(uint8Array);
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.error("Failed to fetch QR code:", error);
    throw error;
  }
};
const cancelTicket = async (ticketId: string): Promise<void> => {
  try {
    await baseApi.post(`/tickets/${ticketId}/cancel`);
  } catch (error) {
    console.error("Failed to cancel ticket:", error);
    throw error;
  }
};
const requestRefund = async (refundRequest: RefundRequest, ticketStatus?: string): Promise<void> => {
  try {
    if (ticketStatus && ticketStatus !== "PAID") {
      console.error(`Cannot request refund for ticket with status: ${ticketStatus}`);
      throw new Error(`Refund is only available for PAID tickets, current status: ${ticketStatus}`);
    }

    const validation = refundRequestSchema.safeParse(refundRequest);

    if (!validation.success) {
      console.error(validation.error);
      throw new Error("Invalid refund request data");
    }

    console.log("Refund request data:", JSON.stringify(refundRequest));

    const modifiedRequest = {
      ...refundRequest,
      userEmail: refundRequest.email,
      user_email: refundRequest.email,
      emailAddress: refundRequest.email,
      email_address: refundRequest.email,
    };

    console.log("Modified refund request data:", JSON.stringify(modifiedRequest));

    try {
      try {
        const response = await baseApi.post("/tickets/refund-request", modifiedRequest);
        console.log("Refund request successful (POST):", response.status, response.statusText);
        return;
      } catch (originalError: any) {
        console.error("Original POST request error:", originalError.message);
        if (originalError.response) {
          console.error("Response status:", originalError.response.status);
          console.error("Response data:", JSON.stringify(originalError.response.data));
        }

        try {
          console.log("Trying with original request data...");
          const originalResponse = await baseApi.post("/tickets/refund-request", refundRequest);
          console.log("Refund request successful (original data):", originalResponse.status, originalResponse.statusText);
          return;
        } catch (originalDataError: any) {
          console.error("Original data request error:", originalDataError.message);
          if (originalDataError.response) {
            console.error("Response status:", originalDataError.response.status);
            console.error("Response data:", JSON.stringify(originalDataError.response.data));
          }
        }

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
          return;
        } catch (simplifiedError: any) {
          console.error("Simplified request error:", simplifiedError.message);
          if (simplifiedError.response) {
            console.error("Response status:", simplifiedError.response.status);
            console.error("Response data:", JSON.stringify(simplifiedError.response.data));
          }
        }

        try {
          console.log("Trying PUT method...");
          const putResponse = await baseApi.put("/tickets/refund-request", modifiedRequest);
          console.log("Refund request successful (PUT):", putResponse.status, putResponse.statusText);
          return;
        } catch (putError: any) {
          console.error("PUT request error:", putError.message);
          if (putError.response) {
            console.error("Response status:", putError.response.status);
            console.error("Response data:", JSON.stringify(putError.response.data));
          }
        }

        throw originalError;
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

const ticketApi = {
  getUserTickets,
  getTicketDetails,
  getQrCode,
  cancelTicket,
  requestRefund,

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
