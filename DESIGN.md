# System Design Document

## Database Schema Design

### Entities

#### 1. User
- `id`: Primary Key (incremental)
- `firstName`: string (255)
- `lastName`: string (255)
- `email`: unique string (255)
- `posts`: One-to-Many with Post
- `followingRelations`: One-to-Many with Follow (follower)
- `followerRelations`: One-to-Many with Follow (following)
- `likedPosts`: Many-to-Many with Post
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### 2. Post
- `id`: Primary Key (incremental)
- `title`: string (255)
- `content`: text
- `auther`: Many-to-One with User
- `likes`: Many-to-Many with User
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### 3. Follow
- `id`: Primary Key (incremental)
- `follower`: Many-to-One with User
- `following`: Many-to-One with User
- `createdAt`: timestamp

### Relationships
- **User ↔ Post**: One user can create many posts.
- **User ↔ Follow**: A user can follow many users and be followed by many users.
- **User ↔ Post (Likes)**: Many-to-Many for liking posts.
- **Post ↔ User (Likes)**: Reverse relationship of likes.
- **Follow**: Acts as a join table for follow relationships between users.

---

## Indexing Strategy

### Default Indexes
- Primary keys on `id` in all entities.
- Unique index on `email` in `User`.

### Suggested Additional Indexes
- `Follow`: Index on `followerId` and `followingId` for fast lookups.
- `Post`: Index on `autherId` for fetching posts by a user.
- `post_likes` join table: Composite index on (`postId`, `userId`).
- `createdAt` and `updatedAt` on all tables for efficient sorting and range queries.

---

## Scalability Considerations

### Horizontal Scalability
- **Database**: Can be scaled via read replicas and sharding on user ID.
- **Application**: Stateless services allow load balancing and easy scaling.

### Caching
- Use Redis for caching:
  - Frequently accessed user profiles.
  - Popular posts and feeds.
  - Follower/following counts.

### Rate Limiting
- Implement user-level rate limits on write-heavy operations (posting, liking, following).

### Pagination
- Consistent pagination in all list endpoints using `limit` and `offset`.

### Bulk Operations
- Use bulk inserts/updates in future features (e.g., batch follow/unfollow).

---

## Other Design Considerations

### Data Integrity
- Enforce foreign key constraints between entities.
- Use transactions for complex operations (e.g., follow/unfollow logic).

### Security
- Unique constraint on `email` to prevent duplicates.
- Sanitize inputs to avoid injection attacks.
- Implement auth middleware for route protection.

### API Performance
- Limit relational joins in production queries to avoid over-fetching.
- Fetch minimal fields where applicable (e.g., when listing followers).

### Monitoring
- Use request logging, error tracking, and query performance analysis.

### Future Enhancements
- Add soft delete using `deletedAt` columns.
- Add full-text search on post content and title.
- Implement feed generation logic based on follows and likes.
