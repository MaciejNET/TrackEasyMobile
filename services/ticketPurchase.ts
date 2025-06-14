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


const ticketPurchaseApi = {
  
  getDiscounts: async (): Promise<Discount[]> => {
    try {
      const response = await searchApi.get('/system-lists/discounts');

      
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

  
  validateDiscountCode: async (code: string): Promise<DiscountCode> => {
    try {
      const response = await searchApi.get(`/discount-codes/${code}`);

      
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

  
  mapCurrencyCodeToString: (code: number): 'PLN' | 'EUR' | 'USD' => {
    switch (code) {
      case 0:
        return 'PLN';
      case 1:
        return 'EUR';
      case 2:
        return 'USD';
      default:
        return 'PLN'; 
    }
  },

  
  mapStringToCurrencyCode: (currency: 'PLN' | 'EUR' | 'USD'): number => {
    switch (currency) {
      case 'PLN':
        return 0;
      case 'EUR':
        return 1;
      case 'USD':
        return 2;
      default:
        return 0; 
    }
  },

  
  calculatePrice: async (ticketData: BuyTicketCommand): Promise<TicketPriceResponse> => {
    try {
      
      const validationResult = buyTicketCommandSchema.safeParse(ticketData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid ticket data');
      }

      const response = await baseApi.post('/tickets/price', ticketData);

      
      
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

  
  buyTicket: async (ticketData: BuyTicketCommand): Promise<string[]> => {
    try {
      
      const validationResult = buyTicketCommandSchema.safeParse(ticketData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid ticket data');
      }

      const response = await baseApi.post('/tickets', ticketData);

      
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

  
  payWithCard: async (paymentData: PayTicketByCardCommand): Promise<void> => {
    try {
      
      const validationResult = payTicketByCardCommandSchema.safeParse(paymentData);
      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid payment data');
      }

      
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
