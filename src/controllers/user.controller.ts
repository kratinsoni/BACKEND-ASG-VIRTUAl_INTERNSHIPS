import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { Between } from 'typeorm';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private followRepository = AppDataSource.getRepository(Follow); // Assuming you have a Follow entity

  async getAllUsers(req: Request, res: Response) {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.userRepository.find({
        skip: offset,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const userToFollowId = parseInt(req.body.userToFollowId);

      if (isNaN(userId) || isNaN(userToFollowId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      if (userId === userToFollowId) {
        return res.status(400).json({ message: "You can't follow yourself" });
      }

      const [user, userToFollow] = await Promise.all([
        this.userRepository.findOneBy({ id: userId }),
        this.userRepository.findOneBy({ id: userToFollowId }),
      ]);

      if (!user || !userToFollow) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingFollow = await this.followRepository.findOne({
        where: {
          follower: { id: userId },
          following: { id: userToFollowId },
        },
      });

      if (existingFollow) {
        return res.status(400).json({ message: 'Already following this user' });
      }

      const follow = this.followRepository.create({
        follower: user,
        following: userToFollow,
      });

      await this.followRepository.save(follow);

      res.json({ message: 'User followed successfully' });
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'Error following user', error });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const userToUnfollowId = parseInt(req.body.userToUnfollowId);

      if (isNaN(userId) || isNaN(userToUnfollowId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      if (userId === userToUnfollowId) {
        return res.status(400).json({ message: "You can't unfollow yourself" });
      }

      const follow = await this.followRepository.findOne({
        where: {
          follower: { id: userId },
          following: { id: userToUnfollowId },
        },
        relations: ['follower', 'following'],
      });

      if (!follow) {
        return res.status(404).json({ message: 'Follow relation not found' });
      }

      await this.followRepository.remove(follow);

      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ message: 'Error unfollowing user', error });
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const followers = await this.followRepository.find({
        skip: offset,
        take: limit,
        where: { following: { id: userId } },
        relations: ['follower'],
        order: { createdAt: 'DESC' },
      });

      const data = followers.map((follow) => ({
        id: follow.follower.id,
        firstName: follow.follower.firstName,
        lastName: follow.follower.lastName,
        followedAt: follow.createdAt,
      }));

      res.json({ count: data.length, data });
    } catch (error) {
      console.error('Error getting followers:', error);
      res.status(500).json({ message: 'Error fetching followers', error });
    }
  }

  async getFollowing(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const following = await this.followRepository.find({
        where: { follower: { id: userId } },
        relations: ['following'],
        order: { createdAt: 'DESC' },
      });

      const data = following.map((follow) => ({
        id: follow.following.id,
        firstName: follow.following.firstName,
        lastName: follow.following.lastName,
        followedAt: follow.createdAt,
      }));

      res.json({ count: data.length, data });
    } catch (error) {
      console.error('Error getting following:', error);
      res.status(500).json({ message: 'Error fetching following list', error });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { type, startDate, endDate, page = 1, limit = 10 } = req.query;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [user, userPosts, likedPosts, followActivities] = await Promise.all([
        this.userRepository.findOneBy({ id: userId }),

        // Posts created by the user
        this.postRepository.find({
          where: {
            auther: { id: userId },
            ...(startDate &&
              endDate && {
                createdAt: Between(new Date(startDate as string), new Date(endDate as string)),
              }),
          },
          order: { createdAt: 'DESC' },
        }),

        // Posts liked by the user
        this.postRepository
          .createQueryBuilder('post')
          .leftJoin('post.likes', 'likeUser')
          .where('likeUser.id = :userId', { userId })
          .andWhere(
            startDate && endDate ? 'post.updatedAt BETWEEN :startDate AND :endDate' : '1=1',
            {
              startDate,
              endDate,
            }
          )
          .orderBy('post.updatedAt', 'DESC')
          .getMany(),

        // Follow activity with timestamps
        this.followRepository
          .createQueryBuilder('follow')
          .leftJoinAndSelect('follow.following', 'followingUser')
          .where('follow.follower = :userId', { userId })
          .andWhere(
            startDate && endDate ? 'follow.createdAt BETWEEN :startDate AND :endDate' : '1=1',
            {
              startDate,
              endDate,
            }
          )
          .orderBy('follow.createdAt', 'DESC')
          .getMany(),
      ]);

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Normalize activities
      let activities: any[] = [];

      if (!type || type === 'post') {
        activities.push(
          ...userPosts.map((post) => ({
            type: 'post',
            message: `Created post: ${post.title}`,
            createdAt: post.createdAt,
          }))
        );
      }

      if (!type || type === 'like') {
        activities.push(
          ...likedPosts.map((post) => ({
            type: 'like',
            message: `Liked post: ${post.title}`,
            createdAt: post.updatedAt,
          }))
        );
      }

      if (!type || type === 'follow') {
        activities.push(
          ...followActivities.map((follow) => ({
            type: 'follow',
            message: `Followed user: ${follow.following.firstName} ${follow.following.lastName}`,
            createdAt: follow.createdAt,
          }))
        );
      }

      // Sort all activities by time
      activities = activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Paginate manually
      const paginated = activities.slice(skip, skip + Number(limit));

      res.json({
        total: activities.length,
        page: Number(page),
        limit: Number(limit),
        data: paginated,
      });
    } catch (err) {
      console.error('Error fetching user activity:', err);
      res.status(500).json({ message: 'Server error', err });
    }
  }
}
