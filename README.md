# conference-booking

## How to run
### Clone the repository
```bash
git clone https://github.com/Dileepadari/conference-booking.git
```

### Install dependencies
```bash
cd conference-booking
npm install
```

### Run the server
```bash
npm run dev
```

## API Endpoints

### Add Conference
```bash
POST http://localhost:8000/api/add-conference
```
```json
{
  "name": "Tech Conference 2024",
  "location": "San Francisco",
  "topics": "AI, ML, Cloud Computing",
  "startTimestamp": "2024-09-01T09:00:00Z",
  "endTimestamp": "2024-09-01T17:00:00Z",
  "availableSlots": 10
}
```

### Add User
```bash
POST http://localhost:8000/api/add-user
```
```json
{
  "userId": "user123",
  "interestedTopics": "AI, ML, Data Science"
}
```

### Book Conference
```bash
POST http://localhost:8000/api/book-conference
```
```json
{
  "conferenceName": "Tech Conference 2024",
  "userId": "user123"
}
```

### Get Booking Status
```bash
GET http://localhost:8000/api/get-booking-status
```
```json
{
    "bookingId": "72b15606-b580-45fb-8a58-f9a9f476ba6f"
}
```

### Conferences Search
```bash
POST http://localhost:8000/api/conferences/search
```
```json
{
    "location": "San Francisco",
    "topics": "AI, ML"
}
```

### Conferences Suggestion
```bash
POST http://localhost:8000/api/conferences/suggestions
```
```json
{
    "userId" : "user1235"
}
```

### Confirm Waitinglist Booking
```bash
POST http://localhost:8000/api/confirm-waitlist-booking
```
```json
{
    "bookingId": "1be9de6c-f15b-44c5-9bd7-045b05e1a13f"
}
```

### Cancel Booking
```bash
POST [/cancel-booking](http://localhost:8000/api/cancel-booking)
```
```json
{
    "bookingId": "44bc7a4e-f8f1-47a5-bb63-d85196054d98"
}
```
