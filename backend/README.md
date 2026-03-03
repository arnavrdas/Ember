# 🔥 Ember API

REST API for the Ember dating app. Built with **Node.js**, **Express**, and **Mongoose**.

---

## 📁 Project Structure

```
ember-api/
├── server.js                 // Entry point. Wires everything together.
│
├── app.js                    // Connects Middlewares & Routes
│
├── .env
│
├── package.json
│
├── config/
│   └── db.js                 ← MongoDB connection
│
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── swipeRoutes.js
│   ├── messageRoutes.js
│
├── middleware/
│   ├── authMiddleware.js     ← JWT token verification
│   └── errorHandler.js       ← Global error responses
│
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── swipeController.js
│   └── messageController.js
│
├── models/
│   ├── User.js               ← User schema & model
│   └── Message.js            ← Message schema & model

└
```

---

## 🚀 Getting Started

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment variables**
```bash
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
```

**3. Start the server**
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

All protected routes require the header:
```
Authorization: Bearer <your_token>
```

### Auth
| Method | URL | Protected | Description |
|--------|-----|-----------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login & get token |
| GET | `/api/auth/me` | Yes | Get current user |

### Profiles
| Method | URL | Protected | Description |
|--------|-----|-----------|-------------|
| GET | `/api/profiles` | Yes | Get Discover profiles |
| PUT | `/api/profiles/me` | Yes | Update your profile |

### Swipe & Matches
| Method | URL | Protected | Description |
|--------|-----|-----------|-------------|
| POST | `/api/swipe` | Yes | Like or pass a profile |
| GET | `/api/matches` | Yes | Get all your matches |

### Messages
| Method | URL | Protected | Description |
|--------|-----|-----------|-------------|
| POST | `/api/messages` | Yes | Send a message |
| GET | `/api/messages/:userId` | Yes | Get conversation |

---

## 📝 Example Request Bodies

**Register**
```json
{ "name": "Alex", "email": "alex@example.com", "password": "secret123", "age": 25 }
```

**Login**
```json
{ "email": "alex@example.com", "password": "secret123" }
```

**Swipe**
```json
{ "targetId": "64abc123...", "direction": "right" }
```

**Send Message**
```json
{ "toId": "64abc123...", "text": "Hey! How's it going?" }
```
