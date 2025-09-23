ZemaTrack Backend
=================

A Node.js backend API for ZemaTrack, built with Express, TypeScript, and MongoDB. This RESTful API handles music upload with AWS S3 integration for file storage.

🚀 Features

- Express.js with TypeScript for type-safe API development

- MongoDB with Mongoose for data persistence

- AWS S3 integration for file storage and management

- Zod for runtime type validation and schema enforcement

- File Upload support with Multer and S3 integration

- Security middlewares (Helmet, CORS)

- Docker support for containerized deployment

- Morgan logging for request monitoring

---
📋 Prerequisites

Manual Installation

- Node.js (v18 or higher)

- MongoDB (v6.0 or higher)

- npm or yarn package manager

- AWS S3 account (for file storage)

Docker Installation

- Docker Engine

- Docker Compose

🛠️ Installation

Option 1: Manual Installation

1. Clone the repository

```bash
git clone https://github.com/zema-track/zematrack-backend.git
cd zematrack-backend
```
2. Install dependencies
```bash
npm install
```

3. Set up environment variables - creating a .env file in the root directory:
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name

```
4. if you are using local mongodb server make sure it is running
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# On macOS with Homebrew
brew services start mongodb-community

# On Windows
net start MongoDB
```

5. Start the development server
```bash
npm run dev
```
The application will be available at http://localhost:3000

--- 

Option 2: Using Docker for Installation

1. Clone the repository

```bash
git clone https://github.com/zema-track/zematrack-backend.git
cd zematrack-backend
```
2. Set up environment variables
Create a .env file (same as manual installation above, but use this MongoDB URI):
```bash
MONGODB_URI=mongodb://database:27017/zematrack  # database is the name of the MongoDB service in docker-compose.yml
```
3. Build the Docker image
```bash
docker compose -f docker-compose.dev.yml build
```

4. Start the Docker containers
```bash
docker compose -f docker-compose.dev.yml up
```
The application will be available at http://localhost:3000

--- 
🏗️ Project Structure
```
src/
├── app.ts              # Express application setup
├── server.ts           # Server entry point
├── config/             # Database and service configurations
├── controllers/        # Request handlers
├── middlewares/        # Custom middleware functions
├── models/             # Mongoose data models
├── routes/             # API route definitions
├── services/           # Business logic and external service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── validators/         # Zod schema validators  
```

👥 Author


Mikiyas Girma


- GitHub: [@mikiyas-girma](https://github.com/mikiyas-girma)
