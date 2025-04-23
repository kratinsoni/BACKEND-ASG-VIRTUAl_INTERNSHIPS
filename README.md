# 🚀 Social Media Backend – Intern Assignment

Welcome to your backend intern assignment! This project is a simplified backend for a social media platform. It includes core features like posts, likes, follows, and hashtags. Let's build the foundation of the next big thing! 🌐

---

## 📦 Features

### 🎯 Core Functionality

- 📝 Create posts with text content  
- 👥 Follow and unfollow other users  
- ❤️ Like and unlike posts  
- #️⃣ Tag posts with hashtags  

---

## 🔌 API Endpoints

Here are the key endpoints you need to implement and test:

### 📜 Post Endpoints

```ts
GET     /api/posts/                   → Get all posts  
GET     /api/posts/:id               → Get post by ID  
POST    /api/posts/                  → Create a new post  
PUT     /api/posts/:id               → Update a post  
DELETE  /api/posts/:id               → Delete a post  
POST    /api/posts/:id/like          → Like a post  
POST    /api/posts/:id/unlike        → Unlike a post  
GET     /api/posts/feed/:id          → Get feed for a user  
GET     /api/posts/:id/likes         → Get all likes on a post  
GET     /api/posts/hashtags/:tag     → Get posts by hashtag  
GET     /api/users/                  → Get all users  
GET     /api/users/:id              → Get user by ID  
POST    /api/users/                 → Create a new user  
PUT     /api/users/:id              → Update user  
DELETE  /api/users/:id              → Delete user  
POST    /api/users/:id/follow       → Follow a user  
POST    /api/users/:id/unfollow     → Unfollow a user  
GET     /api/users/:id/followers    → Get followers of a user (paginated)  
GET     /api/users/:id/activity     → Get user activity (posts, likes, follow actions)  
```

## 🛠️ How to Run the Project

Follow these steps to get the backend server up and running:

### 1. 📥 Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>

npm install
```

### 2. Create a .env file in the root directory of your project. Add the following configuration for the server port:

```
PORT=5000
```

### 3. To generate migration files for your database, use:

```
npm run migration:generate -- path/to/migrations
```

### 4. Once migration files are generated, run the following command to apply them to your database:

```
npm run migration:run
```

### 5. Now, run the development server with the following command:

```
npm run dev
```

### 6. To test the entire backend with predefined scripts, run

```
./test.sh
```

### 🎉 Final Words
This backend provides hands-on experience with RESTful APIs, pagination, filtering, and modular code structure. Be sure to handle edge cases and write clean, maintainable code.

Happy coding and enjoy building! 💻✨
