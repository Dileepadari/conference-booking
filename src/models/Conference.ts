export interface Conference {
  name: string;
  location: string;
  topics: string[];
  startTimestamp: Date;
  endTimestamp: Date;
  availableSlots: number;
  waitlist: { bookingId: string; userId: string; timestamp: Date }[]; // Waitlist users with timestamps
}
