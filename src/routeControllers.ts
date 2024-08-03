import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Conference } from './models/Conference';
import { User } from './models/User';
import { Booking } from './models/Booking';

// In-memory storage for conferences, users, and bookings
let conferences: { [key: string]: Conference } = {};
let users: { [key: string]: User } = {};
let bookings: { [key: string]: Booking } = {};
let lock = false;

// Middleware to acquire lock
const acquireLock = () => {
    while (lock) { }
    lock = true; // Acquire lock
};

const releaseLock = () => {
    lock = false; // Release lock
};

// check validity of a given string
const isValidString = (str: string) => {
    return str.match(/^[a-zA-Z0-9 ]*$/);
}


export const addConference = (req: Request, res: Response) => {
    const { name, location, topics, startTimestamp, endTimestamp, availableSlots } = req.body;
    // Check for presence of all the parameters
    if (!name || !location || !topics || !startTimestamp || !endTimestamp || !availableSlots) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check for characters other than alphanumerics and space
    if (!isValidString(name)) {
        return res.status(400).json({ error: 'Conference name must contain only alphanumeric characters and spaces.' });
    }

    if (!isValidString(location)) {
        return res.status(400).json({ error: 'Location must contain only alphanumeric characters and spaces.' });
    }


    // Check for valid date and time
    if (!new Date(startTimestamp).getTime() || !new Date(endTimestamp).getTime()) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }

    // Validate and ensure uniqueness of conference name
    if (conferences[name]) {
        return res.status(400).json({ error: 'Conference name must be unique.' });
    }

    // Check timestamps
    if (new Date(startTimestamp) >= new Date(endTimestamp)) {
        return res.status(400).json({ error: 'Start time must be before end time.' });
    }

    // Check available slots
    if (availableSlots < 1) {
        return res.status(400).json({ error: 'Available slots must be greater than 0.' });
    }

    conferences[name] = {
        name,
        location,
        topics: topics.split(',').map((topic: string) => topic.trim()),
        startTimestamp: new Date(startTimestamp),
        endTimestamp: new Date(endTimestamp),
        availableSlots,
        waitlist: [],
    };

    res.status(201).json({ message: 'Conference named ' + name + ' added successfully.' });
};

export const addUser = (req: Request, res: Response) => {
    const { userId, interestedTopics } = req.body;

    // Validate and ensure uniqueness of user ID
    if (users[userId]) {
        return res.status(400).json({ error: 'User ID must be unique.' });
    }

    // Check for characters other than alphanumerics and space
    if (!isValidString(userId)) {
        return res.status(400).json({ error: 'User ID must contain only alphanumeric characters and spaces.' });
    }

    users[userId] = {
        userId,
        interestedTopics: interestedTopics.split(',').map((topic: string) => topic.trim()),
    };

    res.status(201).json({ message: 'User ' + userId + ' added successfully.' });
}

export const bookConference = (req: Request, res: Response) => {
    const { conferenceName, userId } = req.body;
    acquireLock(); // Acquire lock

    try {
        const conference = conferences[conferenceName];
        if (!conference) {
            return res.status(404).json({ error: 'Conference does not exist.' });
        }

        if (!users[userId]) {
            return res.status(404).json({ error: 'User does not exist.' });
        }

        // Check for existing bookings
        const existingBooking = Object.values(bookings).find(
            (booking) => booking.userId === userId && booking.conferenceName === conferenceName && booking.status === 'confirmed'
        );

        if (existingBooking) {
            return res.status(400).json({ error: 'User already has an active booking for this conference.', bookingId: existingBooking.bookingId });
        }

        // check if it is overlapping with other conferences of the user
        const userBookings = Object.values(bookings).filter(
            (booking) => booking.userId === userId && booking.status === 'confirmed'
        );
        if(userBookings) {
            for(const booking of userBookings) {
                const otherConference = conferences[booking.conferenceName];
                if((conference.startTimestamp >= otherConference.startTimestamp && conference.startTimestamp <= otherConference.endTimestamp) || 
                    (conference.endTimestamp >= otherConference.startTimestamp && conference.endTimestamp <= otherConference.endTimestamp)) {
                        return res.status(400).json({ error: 'User has another conference booked in the same time slot.' });
                }
            }
        }


        // Check available slots
        if (conference.availableSlots > 0) {
            // Book the conference
            conference.availableSlots -= 1; // Decrement the slot
            const bookingId = uuidv4();
            bookings[bookingId] = { bookingId, conferenceName, userId, status: 'confirmed' };
            return res.status(200).json({ message: 'Booking successful.', bookingId });
        } else {
            // Add to waitlist
            const bookingId = uuidv4();
            bookings[bookingId] = { bookingId, conferenceName, userId, status: 'waitlisted' };
            const waitlistEntry = { bookingId, userId, timestamp: new Date() };
            conference.waitlist.push(waitlistEntry);
            return res.status(200).json({ message: 'All slots filled. Added to waitlist.', bookingId });
        }
    } finally {
        releaseLock(); // Release lock
    }
};

export const cancelBooking = (req: Request, res: Response) => {
    const { bookingId } = req.body;
    acquireLock(); // Acquire lock

    try {
        const booking = bookings[bookingId];
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        if (booking.status === 'canceled') {
            return res.status(400).json({ error: 'Booking already canceled.' });
        }

        // Cancel the booking
        const conference = conferences[booking.conferenceName];
        conference.availableSlots += 1; // Increase available slots
        booking.status = 'canceled'; // Cancel the booking

        // Promote from waitlist if available
        if (conference.waitlist.length > 0) {
            // get first waiting user and after use timeout one hour if the status is still confirmable send it to last
            const nextUser = conference.waitlist[0];

        // Set a timeout for one hour (3600000 ms) for confirming their booking
        const confirmationTimeout = setTimeout(() => {
            // Check if the booking is still confirmable
            if (bookings[nextUser.bookingId].status === 'confirmable') {
                // Move the user to the end of the waitlist
                conference.waitlist.push(nextUser);
                conference.waitlist.shift(); // Remove the user from the front of the waitlist
                bookings[nextUser.bookingId].status = 'waitlisted'; // Update their status

                console.log(`User ${nextUser.userId} did not confirm in time and has been moved to the end of the waitlist.`);
            }
        }, 3600000); // 1 hour

            if (nextUser) {
                bookings[nextUser.bookingId] = { bookingId: nextUser?.bookingId, conferenceName: conference.name, userId: nextUser?.userId, status: 'confirmable' };
            }
            return res.status(200).json({ message: 'Booking canceled. Next user promoted from waitlist.', bookingId: nextUser?.bookingId });
        }

        res.status(200).json({ message: 'Booking canceled.', bookingId: booking.bookingId });
    } finally {
        releaseLock(); // Release lock
    }
};



export const confirmWaitlistBooking = (req: Request, res: Response) => {
    const { bookingId } = req.body;
    acquireLock(); // Acquire lock

    try {
        const booking = bookings[bookingId];
        if(booking && booking.status === 'confirmed'){
            return res.status(400).json({ error: 'Booking already confirmed.' });
        }

        if (!booking || booking.status !== 'confirmable' ) {
            return res.status(404).json({ error: 'Not slots available or no booking done.' });
        }

        const conference = conferences[booking.conferenceName];
        if (conference.availableSlots > 0) {
            conference.availableSlots -= 1; // Decrement the slot
            booking.status = 'confirmed'; // Confirm the booking
            return res.status(200).json({ message: 'Booking confirmed.', bookingId });
        } else {
            return res.status(400).json({ error: 'No available slots.' });
        }
    } finally {
        releaseLock(); // Release lock
    }
};


export const getBookingStatus = (req: Request, res: Response) => {
    const { bookingId } = req.body;
    const booking = bookings[bookingId];
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found.' });
    }

    res.status(200).json({ bookingId, status: booking.status });
};


export const searchConferences = (req: Request, res: Response) => {
    const { location, topics } = req.body;
    const results = Object.values(conferences).filter((conference) => {
        return (
            (!location || conference.location.includes(location as string)) &&
            (!topics || conference.topics.some((topic) => topics?.toString().includes(topic)))
        );
    });
    res.status(200).json(results);
};


export const suggestedConferences = (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = users[userId];

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const suggestions = Object.values(conferences)
        .filter((conference) =>
            conference.topics.some((topic) => user.interestedTopics.includes(topic))
        )
        .slice(0, 10); // Top 10 suggestions

    res.status(200).json(suggestions);
};