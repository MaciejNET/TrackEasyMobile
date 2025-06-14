import baseApi from './baseApi';
import searchApi from './searchApi';
import { z } from 'zod';
import { 
  discountSchema, 
  discountCodeSchema, 
  buyTicketCommandSchema, 
  payTicketByCardCommandSchema,
  ticketPriceResponseSchema,
  Discount,
  DiscountCode,
  BuyTicketCommand,
  PayTicketByCardCommand,
  TicketPriceResponse
} from '@/schemas/ticket-purchase';

// Ticket Purchase API functions
const ticketPurchaseApi = {
  // Get list of available discounts
  getDiscounts: async (): Promise<Discount[]> => {
    try {
      const response = await searchApi.get('/system-lists/discounts');

      // Parse response with Zod schema
      const discounts = z.array(discountSchema).safeParse(response.data);
      if (!discounts.success) {
        console.error('Invalid discounts data:', discounts.error);
        throw new Error('Invalid discounts data received from server');
      }

      return discounts.data;
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      throw error;
    }
  },

  // Validate discount code
  validateDiscountCode: async (code: string): Promise<DiscountCode> => {
    try {
      const response = await searchApi.get(`/discount-codes/${code}`);

      // Parse response with Zod schema
      const discountCode = discountCodeSchema.safeParse(response.data);
      if (!discountCode.success) {
        console.error('Invalid discount code data:', discountCode.error);
        throw new Error('Invalid discount code data received from server');
      }

      return discountCode.data;
    } catch (error) {
      console.error('Failed to validate discount code:', error);
      throw error;
    }
  },

  // Map numeric currency code to string
  mapCurrencyCodeToString: (code: number): 'PLN' | 'EUR' | 'USD' => {
    switch (code) {
      case 0:
        return 'PLN';
      case 1:
        return 'EUR';
      case 2:
        return 'USD';
      default:
        return 'PLN'; // Default to PLN if code is unknown
    }
  },

  // Map string currency to numeric code
  mapStringToCurrencyCode: (currency: 'PLN' | 'EUR' | 'USD'): number => {
    switch (currency) {
      case 'PLN':
        return 0;
      case 'EUR':
        return 1;
      case 'USD':
        return 2;
      default:
        return 0; // Default to PLN if currency is unknown
    }
  },

  // Calculate ticket price
  calculatePrice: async (ticketData: BuyTicketCommand): Promise<TicketPriceResponse> => {
    try {
      // Validate ticket data with Zod schema
      const validationResult = buyTicketCommandSchema.safeParse(ticketData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid ticket data');
      }

      const response = await baseApi.post('/tickets/price', ticketData);

      // Preprocess the response data
      // The API may return a MoneyDto with fields `amount` and `currency`
      const rawAmount =
        response.data.amount !== undefined
          ? response.data.amount
          : response.data.price;

      const priceValue =
        typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount;

      if (priceValue === undefined || isNaN(priceValue)) {
        throw new Error('Invalid price value received from server');
      }

      const preprocessedData = {
        price: priceValue,
        currency:
          typeof response.data.currency === 'number'
            ? ticketPurchaseApi.mapCurrencyCodeToString(response.data.currency)
            : response.data.currency,
      };

      // Parse response with Zod schema
      const ticketPrice = ticketPriceResponseSchema.safeParse(preprocessedData);
      if (!ticketPrice.success) {
        console.error('Invalid ticket price data:', ticketPrice.error);
        throw new Error('Invalid ticket price data received from server');
      }

      return ticketPrice.data;
    } catch (error) {
      console.error('Failed to calculate ticket price:', error);
      throw error;
    }
  },

  // Buy ticket
  buyTicket: async (ticketData: BuyTicketCommand): Promise<string[]> => {
    try {
      // Validate ticket data with Zod schema
      const validationResult = buyTicketCommandSchema.safeParse(ticketData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid ticket data');
      }

      const response = await baseApi.post('/tickets', ticketData);

      // Parse response as array of ticket IDs
      const ticketIds = z.array(z.string().uuid()).safeParse(response.data);
      if (!ticketIds.success) {
        console.error('Invalid ticket IDs:', ticketIds.error);
        throw new Error('Invalid ticket IDs received from server');
      }

      return ticketIds.data;
    } catch (error) {
      console.error('Failed to buy ticket:', error);
      throw error;
    }
  },

  // Pay for ticket with card
  payWithCard: async (paymentData: PayTicketByCardCommand): Promise<void> => {
    try {
      // Validate payment data with Zod schema
      const validationResult = payTicketByCardCommandSchema.safeParse(paymentData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid payment data');
      }

      // Convert string currency to numeric code for backend
      const modifiedPaymentData = {
        ...paymentData,
        currency: ticketPurchaseApi.mapStringToCurrencyCode(paymentData.currency)
      };

      await baseApi.post('/tickets/payment/card', modifiedPaymentData);
    } catch (error) {
      console.error('Failed to process card payment:', error);
      throw error;
    }
  }
};

export default ticketPurchaseApi;
