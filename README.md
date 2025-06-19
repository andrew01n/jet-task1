# Online Shop API

A minimalistic backend web application for an online shop built with Node.js, Express, Drizzle ORM, and PostgreSQL.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your DB (NO SIGNUP REQUIRED)**

   Visit [Neon - Serverless Postgres](https://neon.new/) to create a free PostgreSQL database.
   After creating your database, copy your connection string and add it to your `.env` file:
   ```bash
   DATABASE_URL=your_connection_string_here
   ```


3. **Set up the database**
   ```bash
   npm run db:push
   ```
   This will create all tables in your database according to your Drizzle schema.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

5. **To run tests**
   ```bash
   npm test
   ```
   This will run all tests using Jest.