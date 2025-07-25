export interface WebhookEvent {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: string;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';