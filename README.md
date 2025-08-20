# Flow-83-bot – Case Study

This repository is a **case study** of work I did for a client project.  
I was asked to stabilize and refactor an existing AI bot platform (React + Supabase + GPT).  
The original system had several issues – disconnected DB, prompts stored in client code, duplicated logic, and inconsistent conversation flow.

### Fixes and improvements
- Rebuilt the architecture to have a clear separation between client and server.  
- Connected the app properly to Supabase (PostgreSQL + Edge Functions).  
- Moved all prompt templates to the database with secure access.  
- Implemented context-aware conversations (sliding window, no duplicated history).  
- Removed duplicate code and unified critical functions.  
- Added support for reliable automated messages tied to user state.

**Result:** The system now provides consistent, secure, and context-aware conversations as expected from an LLM-based bot.
