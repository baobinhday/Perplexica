# System Patterns

## Architecture
- Next.js App Router architecture
- API Routes for backend functionality
- Component-based UI structure
- Database integration using Drizzle ORM
- User association with chats for personalized chat management

## Key Technical Patterns

### Frontend
- React Server Components
- Tailwind CSS for styling
- Theme provider for dark/light mode
- Modular component architecture in `/src/components`
- Dedicated UI components in `/src/components/ui`

### Backend
- API route handlers in `/src/app/api`
- Modular chain system for different search types
- Multiple AI provider integrations
- Output parser system for standardizing responses
- Database schema management with Drizzle
- User management system with relational database design

### Authentication System
- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt for secure storage
- Token refresh mechanism for extended sessions
- Protected routes with authentication middleware
- User session management
- Secure password reset flow

### Search System
- Meta search agent architecture
- Specialized agents for different content types:
  - Image search
  - Video search
  - Academic search
  - Web search
  - Reddit search

### AI Integration
- Multiple provider support:
  - Anthropic
  - OpenAI
  - Gemini
  - Groq
  - Deepseek
  - Ollama
  - Hugging Face Transformers
- Prompt management system in `/src/lib/prompts`

### File Management
- Upload system with dedicated storage
- Document utilities for file handling
- Compute similarity features

## Design Decisions
- Separation of concerns between UI components and business logic
- Modular provider system for easy AI integration
- Extensible search architecture
- Type-safe database operations
- Server-side rendering for optimal performance
- Relational database design for user-chat associations
- Secure authentication with token rotation
- Password security with salted hashing