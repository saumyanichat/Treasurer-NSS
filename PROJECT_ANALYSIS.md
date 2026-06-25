# NSS Treasurer Project - Comprehensive Analysis

## 📋 Project Overview

**NSS Treasurer** is a full-stack personal finance management application designed to help track accounts, transactions, budgets, and financial records. It combines a **Spring Boot 3.3.0** backend with a **React + Vite** frontend, featuring OAuth2 authentication via Clerk, AI-powered receipt parsing, and email notifications.

---

## 🏗️ Project Structure

```
NSS-Treasurer/
├── backend/                    # Spring Boot REST API
│   ├── pom.xml                # Maven configuration
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/nss/treasurer/
│       │   │       ├── TreasurerApplication.java    # Main Spring Boot app
│       │   │       ├── config/
│       │   │       │   └── SecurityConfig.java       # OAuth2 security setup
│       │   │       ├── controller/                   # REST API endpoints
│       │   │       │   ├── AccountController.java
│       │   │       │   ├── AuthController.java
│       │   │       │   ├── BudgetController.java
│       │   │       │   └── TransactionController.java
│       │   │       ├── service/                      # Business logic layer
│       │   │       │   ├── AccountService.java
│       │   │       │   ├── AuthService.java
│       │   │       │   ├── BudgetService.java
│       │   │       │   ├── EmailService.java         # Email via Resend API
│       │   │       │   ├── GeminiService.java        # AI receipt parsing
│       │   │       │   ├── SchedulerService.java     # Scheduled tasks
│       │   │       │   ├── TransactionService.java
│       │   │       │   └── UserService.java
│       │   │       ├── model/                        # JPA entities
│       │   │       │   ├── User.java
│       │   │       │   ├── Account.java
│       │   │       │   ├── Transaction.java
│       │   │       │   ├── Budget.java
│       │   │       │   ├── AccountType.java          # CURRENT, SAVINGS
│       │   │       │   ├── TransactionType.java      # INCOME, EXPENSE
│       │   │       │   ├── TransactionStatus.java
│       │   │       │   └── RecurringInterval.java
│       │   │       ├── repository/                   # Data access layer
│       │   │       │   ├── UserRepository.java
│       │   │       │   ├── AccountRepository.java
│       │   │       │   ├── TransactionRepository.java
│       │   │       │   └── BudgetRepository.java
│       │   │       └── dto/                          # Data transfer objects
│       │   │           ├── TransactionDTO.java
│       │   │           ├── AccountDTO.java
│       │   │           ├── UserSyncDTO.java
│       │   │           └── ReceiptDataDTO.java
│       │   └── resources/
│       │       └── application.properties            # Spring Boot config
│       └── test/
│           └── java/                                 # Unit tests
├── frontend/                   # React + Vite application
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                                 # React entry point
│       ├── App.jsx                                  # Main router
│       ├── App.css
│       ├── index.css
│       ├── pages/                                   # Page components
│       │   ├── LandingPage.jsx                      # Public landing
│       │   ├── Dashboard.jsx                        # Main dashboard
│       │   ├── AccountDetail.jsx                    # Account details
│       │   └── CreateTransaction.jsx                # Transaction form
│       ├── components/                              # Reusable components
│       │   ├── Header.jsx                           # Navigation header
│       │   └── ui/
│       │       ├── button.jsx                       # UI button component
│       │       └── card.jsx                         # UI card component
│       ├── hooks/
│       │   └── useAuthToken.js                      # Clerk auth hook
│       ├── lib/
│       │   ├── api.js                               # API client (Axios)
│       │   └── utils.js                             # Utility functions
│       └── assets/                                  # Static assets
└── maven/                      # Local Maven installation
```

---

## 🔧 Backend Technology Stack

### Core Framework
- **Spring Boot 3.3.0** - Latest stable version
- **Java 17** - Target language version
- **Maven** - Build and dependency management

### Key Dependencies

#### Data & Persistence
- **spring-boot-starter-data-jpa** - ORM framework (Hibernate)
- **PostgreSQL Driver** - Database connection
- **Hibernate** - SQL Dialect for PostgreSQL

#### Security & Authentication
- **spring-boot-starter-security** - Core security
- **spring-boot-starter-oauth2-resource-server** - OAuth2 resource server
- **Clerk** - OAuth2 provider for authentication (`sk_test_e448zopAOCvTX5hgC4mgAugAk9kq7iIazouuKEFUvN`)

#### Web & API
- **spring-boot-starter-web** - REST API development
- **spring-boot-starter-validation** - Input validation

#### AI & Integration
- **spring-ai-bom 1.0.0-M1** - Spring AI framework (Milestone version)
- **Google Gemini API** - Receipt parsing & AI features (`AIzaSyAzfJ1AynmMqgyoLkU_X6BpBOIkLGmejpM`)
- **Resend API** - Email service (`re_YqRHte8H_7jWKSQEzX3zPhz4TDSR5w5bR`)

#### Development Tools
- **Lombok** - Boilerplate reduction (annotations for getters/setters)
- **spring-dotenv 4.0.0** - Automatic `.env` file loading
- **Spring Boot Test** - Testing framework

### Database
- **PostgreSQL** - Primary database
- **Connection**: `jdbc:postgresql://localhost:5432/nss_treasurer`
- **User**: postgres
- **DDL Strategy**: `update` (auto-creates/updates schema)

### Application Configuration
- **Name**: treasurer
- **Logging**: SQL queries and hibernate binder debug enabled
- **Scheduling**: Enabled with `@EnableScheduling`

---

## 🎨 Frontend Technology Stack

### Core Framework
- **React 19.2.4** - Latest React version with Ref Cleanup
- **Vite 8.0.4** - Modern build tool (ESM-based)
- **React DOM 19.2.4**
- **React Router DOM 7.14.1** - Client-side routing

### State Management & Forms
- **TanStack React Query 5.99.0** - Data fetching & caching
- **React Hook Form 7.72.1** - Form state management
- **Zod 4.3.6** - Schema validation

### UI & Styling
- **Tailwind CSS 4.2.2** - Utility-first CSS framework
- **@tailwindcss/vite 4.2.2** - Tailwind Vite plugin
- **Class Variance Authority 0.7.1** - Variant management
- **clsx 2.1.1** - Conditional className utility
- **Tailwind Merge 3.5.0** - Merge Tailwind classes intelligently

### Component Libraries
- **Lucide React 1.8.0** - Icon library
- **Radix UI React Slot 1.2.4** - Primitive component composition
- **Vaul 1.1.2** - Drawer/modal component

### Features & Utilities
- **Framer Motion 12.38.0** - Animation library
- **date-fns 4.1.0** - Date manipulation
- **Recharts 3.8.1** - Chart & graph library
- **Sonner 2.0.7** - Toast notifications
- **Axios 1.15.0** - HTTP client for API calls

### Authentication
- **@clerk/clerk-react 5.61.4** - Clerk authentication provider
- **Auth Integration**: Via Clerk OAuth2 with JWK validation

### Development Tools
- **@vitejs/plugin-react 6.0.1** - React Fast Refresh
- **ESLint 9.39.4** - Code linting
  - **eslint-plugin-react-hooks** - React hooks linting
  - **eslint-plugin-react-refresh** - React refresh linting
- **@types/react & @types/react-dom** - TypeScript support

### Dev Dependencies
- **globals 17.4.0** - Global object types

---

## 🔌 API Endpoints

### Authentication
- **POST** `/api/auth/*` - Auth-related endpoints (via AuthController)

### Accounts Management
- **GET** `/api/accounts` - Fetch all accounts for user
- **POST** `/api/accounts` - Create new account
- **GET** `/api/accounts/{id}` - Get account details

### Transactions
- **POST** `/api/transactions` - Create transaction
- **DELETE** `/api/transactions/{id}` - Delete transaction

### Budgets
- **GET** `/api/budgets/*` - Budget endpoints
- **POST** `/api/budgets` - Create/update budget
- (Full endpoints in BudgetController)

---

## 📊 Data Models

### User Entity
```
- id (UUID)
- clerkUserId (unique, from Clerk)
- email (unique)
- name
- imageUrl
- relationships: transactions, accounts, budgets
- timestamps: createdAt, updatedAt
```

### Account Entity
```
- id (UUID)
- name
- type (CURRENT or SAVINGS)
- balance (BigDecimal)
- isDefault (boolean)
- user (FK)
- transactions (relationship)
- timestamps: createdAt, updatedAt
```

### Transaction Entity
```
- id (UUID)
- type (INCOME or EXPENSE)
- amount (BigDecimal)
- description
- date (LocalDateTime)
- category
- receiptUrl
- isRecurring (boolean)
- recurringInterval (DAILY, WEEKLY, MONTHLY, YEARLY)
- nextRecurringDate
- lastProcessed
- status (COMPLETED, PENDING, CANCELLED)
- user (FK)
- account (FK)
- timestamps: createdAt, updatedAt
```

### Budget Entity
```
- id (UUID)
- amount (BigDecimal)
- lastAlertSent (LocalDateTime)
- user (one-to-one relationship)
- timestamps: createdAt, updatedAt
```

---

## 🎯 Frontend Routes

```
/ → LandingPage (Public landing page)
/dashboard → Dashboard (Main user dashboard)
/account/:id → AccountDetail (Account details page)
/transaction/create → CreateTransaction (Create transaction form)
```

---

## 🔐 Security & Authentication

### Backend
- **OAuth2 Resource Server** using Clerk
- **JWK Set URL**: `https://careful-kite-39.clerk.accounts.dev/.well-known/jwks.json`
- **API Key**: `sk_test_e448zopAOCvTX5hgC4mgAugAk9kq7iIazouuKEFUvN`
- **JWT Validation** on all protected endpoints
- **@AuthenticationPrincipal Jwt jwt** - Extracts user from token

### Frontend
- **Clerk Authentication** provider via `@clerk/clerk-react`
- **useAuthToken() hook** - Manages token in main App
- Protected pages require authentication

---

## 🤖 AI & External Integrations

### Google Gemini
- **Purpose**: AI-powered receipt parsing from images
- **API Key**: `AIzaSyAzfJ1AynmMqgyoLkU_X6BpBOIkLGmejpM`
- **Service**: GeminiService - parseReceipt(imageUrl)
- **Status**: Currently mocked (Spring AI dependency is a milestone version)
- **Returns**: ReceiptDataDTO with amount, date, category, type

### Resend Email Service
- **Purpose**: Send emails for notifications and alerts
- **API Key**: `re_YqRHte8H_7jWKSQEzX3zPhz4TDSR5w5bR`
- **From Email**: `onboarding@resend.dev`
- **Service**: EmailService - sendEmail(toEmail, subject, htmlBody)
- **Use Cases**: Budget alerts, transaction confirmations, notifications

### Clerk Authentication
- **Purpose**: User authentication and authorization
- **Organization**: careful-kite-39
- **Features**: OAuth2, JWK validation, user data sync
- **Integration**: Both backend (JWT validation) and frontend (React provider)

---

## ⚙️ Key Features

### 1. **Multi-Account Management**
   - Create and manage multiple accounts (Savings, Current)
   - Set default account
   - Track account balance

### 2. **Transaction Tracking**
   - Income & expense transactions
   - Categories for organization
   - Receipt attachment support
   - Recurring transactions (daily, weekly, monthly, yearly)
   - Transaction status tracking

### 3. **Budget Management**
   - Set spending budgets
   - Budget alert system
   - Track spending vs. budget

### 4. **AI Receipt Parsing**
   - Upload receipts/images
   - AI extracts transaction details
   - Auto-populates transaction form

### 5. **Email Notifications**
   - Scheduled alerts
   - Budget notifications
   - Transaction confirmations

### 6. **Responsive UI**
   - Tailwind CSS styling
   - Charts & visualizations (Recharts)
   - Toast notifications
   - Smooth animations (Framer Motion)

---

## 🚀 Build & Deployment

### Backend Build
```bash
# Maven build
mvn clean package

# Run
java -jar target/treasurer-0.0.1-SNAPSHOT.jar
```

### Frontend Build
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

---

## 📝 Database Configuration

- **Type**: PostgreSQL
- **Host**: localhost:5432
- **Database**: nss_treasurer
- **User**: postgres
- **Password**: saumyanichat__2005
- **Auto DDL**: Update (schema auto-creation enabled)

---

## 🔄 Background Services

- **SchedulerService** - Handles scheduled/recurring transactions
- **Automatic Scheduling**: Enabled with `@EnableScheduling` in TreasurerApplication
- **Processed Transactions**: Track last processed date and next occurrence

---

## 📦 Dependencies Summary

### Backend
- **Total major frameworks**: 6 (Spring Boot, Spring Security, Spring Data JPA, Spring AI, Clerk, Resend)
- **Database**: PostgreSQL (JDBC)
- **Build Tool**: Maven 3.9.x
- **Annotation Processing**: Lombok

### Frontend
- **Node Modules**: 20+ dependencies
- **Dev Dependencies**: 8 main build/lint tools
- **Package Manager**: npm/yarn compatible
- **Node Version**: 18+ recommended (for Vite 8)

---

## 🎓 Architecture Overview

```
Frontend (React)
├── Pages (routing with React Router)
├── Components (reusable UI)
├── Hooks (custom auth, data fetching)
└── API Client (Axios to backend)
    ↓
Backend (Spring Boot)
├── Controllers (REST endpoints)
├── Services (business logic)
├── Repositories (data access)
└── Entities (database models)
    ↓
PostgreSQL Database
```

---

## ✨ Notable Characteristics

1. **Modern Stack**: Latest versions of React 19, Spring Boot 3.3, Vite 8
2. **Type Safety**: Java/Spring on backend, TypeScript-ready frontend
3. **Security-First**: OAuth2 authentication, JWT validation
4. **AI Integration**: Gemini for smart receipt processing
5. **Email Automation**: Resend API for notifications
6. **Responsive Design**: Tailwind CSS + modern components
7. **Developer Experience**: Vite fast refresh, Spring Boot DevTools ready
8. **Database-First**: PostgreSQL with Hibernate auto-schema management

---

## 🔗 External APIs & Services

| Service | Purpose | Status |
|---------|---------|--------|
| Clerk | Authentication | ✅ Active |
| Google Gemini | Receipt Parsing | ⚠️ Mocked (milestone version) |
| Resend | Email Delivery | ✅ Active |
| PostgreSQL | Data Persistence | ✅ Active |

---

## 📊 Project Scale

- **Backend**: ~1,500-2,000 LOC (estimated, across controller, service, model, repository layers)
- **Frontend**: ~800-1,200 LOC (across pages, components, hooks)
- **Configuration**: ~200 LOC (pom.xml, application.properties, vite.config.js)
- **Total**: ~2,500-3,400 estimated lines of code

---

## 🎯 Next Steps for Development

1. **Complete Gemini Integration**: Replace mocked GeminiService with actual Spring AI implementation
2. **Add Unit Tests**: Implement comprehensive test coverage
3. **API Documentation**: Add Swagger/OpenAPI documentation
4. **Error Handling**: Enhance error responses and validation
5. **Frontend Optimization**: Add code splitting, lazy loading
6. **Database Migrations**: Implement Flyway/Liquibase
7. **CI/CD Pipeline**: GitHub Actions or similar
8. **Deployment**: Containerize with Docker, deploy to Azure/AWS

