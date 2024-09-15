
# BookShelf

BookShelf is a comprehensive web application for book enthusiasts to manage their reading lists, connect with friends, and engage in literary discussions. Built using the MERN (MongoDB, Express, React, Node.js) stack.

## Features

- **User authentication and profile management**
- **Personal book library** with reading progress tracking
- **Social networking** features including friends list and chat functionality
- **Book search and discovery system**
- **Comment system** for user profiles and books
- **Responsive design** for mobile and desktop use

## Technologies Used

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Additional libraries/frameworks:** 
  - Socket.io (for real-time chat functionality)
  - JWT (for authentication)
  - Mongoose (for MongoDB ORM)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ManasaSita/Book-App.git
   ```
2. Install dependencies for both the `client` and `server`:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following values:
   ```
   MONGO_URI=mongodb+srv://manasar04279080:wTk6spkhWO0sbNBU@cluster0.tawrbfy.mongodb.net/bookShelf?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=260b1cc77d84e4a24889bb17c3d07dff0fb22fdfcb9a442ba53f94f83894e78f
   PORT=5000
   ```

4. Run the application using `concurrently`:
   ```bash
   npm run dev
   ```

## Usage

Once the application is running, you can access it at `http://localhost:3000`. Users can register, log in, and start managing their personal book collections. The chat feature allows users to communicate with friends, and users can track their reading progress, write reviews, and leave comments on profiles and books.

## MongoDB Schema

The project uses the following main collections:

### Users
Stores user information including:
- `username` (String)
- `email` (String)
- `password` (String)
- `friends` (Array of User IDs)

### Books
Contains book information including:
- `title` (String)
- `author` (String)
- `description` (String)
- `thumbnail` (String)
- `averageRating` (Number)
- `pageCount` (Number)

### MyBooks
Links users to their books and stores:
- `userId` (User ID)
- `bookId` (Book ID)
- `readingStatus` (String, e.g., "Reading", "Completed", etc.)
- `rating` (Number)
- `review` (String)

### FriendRequests
Manages friend requests between users, tracking:
- `fromUserId` (User ID)
- `toUserId` (User ID)
- `status` (String, e.g., "Pending", "Accepted")

### Friends
Stores friendships and allows users to leave comments on friends' profiles:
- `userId` (User ID)
- `friendId` (Friend ID)
- `comments` (Array of Comment IDs)

### Messages
Stores chat messages between users:
- `fromUserId` (User ID)
- `toUserId` (User ID)
- `message` (String)
- `timestamp` (Date)

## Key Features of the Schema

- **User relationships** are managed through the `Friends` and `FriendRequests` collections.
- The `MyBooks` collection allows users to track their reading progress, rate books, and write reviews.
- The `Friends` collection includes a nested comment schema for leaving comments on friends' profiles, with optional book recommendations.
- The `Messages` collection facilitates direct communication between users.

For detailed schema information, please refer to the models in the `server/models` directory.
