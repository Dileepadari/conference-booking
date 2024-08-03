# API's for testing

## add_conference
{
  "name": "Tech Conference 2024",
  "location": "San Francisco",
  "topics": "AI, ML, Cloud Computing",
  "startTimestamp": "2024-09-01T09:00:00Z",
  "endTimestamp": "2024-09-01T17:00:00Z",
  "availableSlots": 10
}

## add User
{
  "userId": "user123",
  "interestedTopics": "AI, ML, Data Science"
}

## book_conference
{
  "conferenceName": "Tech Conference 2024",
  "userId": "user123"
}

## get_booking_status
{
    "bookingId":"id_here"
}

## conferences-search
{
    "location": "San Francisco",
    "topics": "AI, ML"
}

## conferences-suggestions
{
    "userId" : "user1235"
}

## confirm-waitlist-booking
{
    "bookingId": "1be9de6c-f15b-44c5-9bd7-045b05e1a13f"
}

## Cancel Booking
{
    "bookingId": "44bc7a4e-f8f1-47a5-bb63-d85196054d98"
}
