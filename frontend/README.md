# Pagewise: Online Bookstore

A full-stack online bookstore where customers browse books, add them to a cart and place orders, and admins manage the catalog. Built with **ASP.NET Core Web API**, **PostgreSQL** and **React**.

<!-- Replace with a screenshot or demo GIF -->
![Pagewise home page](docs/screenshot-home.png)

**Live demo:** _add link_ · **API docs:** _add link_

## Features

**Customers**
- Browse the catalog with search, category filters and sorting
- View book details with price, rating and stock
- Add items to a cart and place orders
- Register, log in and view order history

**Admins**
- Add and delete books
- View basic stats (books, orders, revenue)

**Interface**
- Animated bookshelf hero, 3D-tilt book covers, sliding cart drawer and animated filtering
- Responsive layout, keyboard-accessible controls and reduced-motion support

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend | C#, .NET 10, ASP.NET Core Web API |
| Database | PostgreSQL, Entity Framework Core (Npgsql) |
| Auth | JWT, role-based authorization (Admin / Customer) |
| Testing | xUnit |

## Project Structure

```
bookstore/
├── backend/
│   └── Bookstore.Api/        # ASP.NET Core Web API
│       ├── Controllers/
│       ├── Models/
│       ├── Data/             # AppDbContext, migrations
│       └── Program.cs
└── frontend/                 # React app
    └── src/
        ├── App.tsx           # Pages and components
        ├── store.tsx         # Cart, auth, orders state
        ├── lib.ts            # API helper and demo data
        └── main.tsx
```

## Getting Started

### Prerequisites
- [.NET SDK 10 (LTS)](https://dotnet.microsoft.com/download)
- [Node.js (LTS)](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/)

### 1. Database
Create a database named `bookstore` in PostgreSQL.

### 2. Backend
```bash
cd backend/Bookstore.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=bookstore;Username=postgres;Password=YOUR_PASSWORD"
dotnet ef database update
dotnet run
```
Note the HTTPS address printed in the terminal.

### 3. Frontend
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=https://localhost:YOUR_PORT
```
Then start the dev server:
```bash
npm run dev
```
Open `http://localhost:5173`.

> If the API is not running, the frontend falls back to demo data so you can still explore the UI.

## API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/books` | List books | Public |
| POST | `/api/books` | Create a book | Admin |
| DELETE | `/api/books/{id}` | Delete a book | Admin |
| POST | `/api/auth/register` | Create an account | Public |
| POST | `/api/auth/login` | Log in, returns a JWT | Public |
| POST | `/api/orders` | Place an order | Customer |

## Roadmap

- [ ] Complete backend: entities, endpoints and JWT authentication
- [ ] Server-side search, filtering and pagination
- [ ] Stock validation and order totals calculated on the server
- [ ] Unit tests for order logic (xUnit)
- [ ] Docker Compose for API, database and frontend
- [ ] Deployment
- [ ] Free sample reading for public-domain books

## What I Learned

- Designing a REST API with ASP.NET Core and Entity Framework Core
- Modeling relational data in PostgreSQL
- Securing endpoints with JWT and role-based authorization
- Managing global state and building animated UI in React

## Author

**Gihan Benaragama**
Software Engineering undergraduate · [GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)

## License

Released under the [MIT License](LICENSE).