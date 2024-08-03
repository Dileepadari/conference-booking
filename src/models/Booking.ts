export interface Booking {
    bookingId: string;
    conferenceName: string;
    userId: string;
    status: 'confirmed' | 'waitlisted' | 'canceled' | 'confirmable';
}
