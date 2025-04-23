import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import { AppDataSource } from '../data-source';
import { In } from 'typeorm';

export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);

  async getAllPosts(req: Request, res: Response) {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;

      const posts = await this.postRepository.find({
        skip: offset,
        take: limit,
      });

      if (!posts || posts.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostById(req: Request, res: Response) {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    try {
      const post = await this.postRepository.findOneBy({
        id: postId,
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const { autherId, ...postData } = req.body;
      const auther = await this.userRepository.findOneBy({ id: autherId });
      if (!auther) {
        return res.status(404).json({ message: 'Author not found' });
      }

      const post = this.postRepository.create({ ...postData, auther });

      if (!post) {
        return res.status(400).json({ message: 'Problem in creating Post' });
      }

      const result = await this.postRepository.save(post);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Error creating post', error });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await this.postRepository.findOneBy({
        id: postId,
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const { ...postData } = req.body;

      this.postRepository.merge(post, postData);

      const result = await this.postRepository.save(post);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const result = await this.postRepository.delete(postId);
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  }

  async likePost(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['likes'], // 👈 load likes
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const userId = parseInt(req.body.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Optional: prevent duplicate likes
      if (!post.likes.some((u) => u.id === user.id)) {
        post.likes.push(user);
      } else {
        return res.json({ message: 'Post Already liked' });
      }

      const updatedPost = await this.postRepository.save(post);

      res.json(updatedPost);
    } catch (error) {
      console.log('Error liking post:', error);
      res.status(500).json({ message: 'Error liking post', error });
    }
  }

  async unlikePost(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['likes'], // 👈 load likes
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const userId = parseInt(req.body.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      post.likes = post.likes.filter((like) => like.id !== user.id);
      await this.postRepository.save(post);

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error unliking post', error });
    }
  }

  async getPostLikes(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }

      const post = await this.postRepository.findOne({
        where: { id: postId },
        relations: ['likes'], // 👈 load likes
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.json(post.likes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post likes', error });
    }
  }

  async getFeed(req: Request, res: Response) {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get all users that the current user is following
      const followRelations = await this.followRepository.find({
        where: { follower: { id: userId } },
        relations: ['following'],
      });

      const followingIds = followRelations.map((rel) => rel.following.id);

      if (followingIds.length === 0) {
        return res.json([]); // Empty feed if user follows no one
      }

      // Get posts from all followed users
      const posts = await this.postRepository.find({
        skip: offset,
        take: limit,
        where: {
          auther: { id: In(followingIds) },
        },
        relations: ['auther', 'likes'],
        order: { createdAt: 'DESC' },
      });

      res.json(posts);
    } catch (error) {
      console.error('Error fetching feed:', error);
      res.status(500).json({ message: 'Error fetching feed', error });
    }
  }

  async getPostsWithHashtags(req: Request, res: Response) {
    try {
      const hashtags = req.params.hashtag.split(',');
      if (!hashtags || hashtags.length === 0) {
        return res.status(400).json({ message: 'No hashtags provided' });
      }

      const queryBuilder = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.auther', 'auther')
        .leftJoinAndSelect('post.likes', 'likes');

      hashtags.forEach((tag, index) => {
        const paramKey = `tag${index}`;
        if (index === 0) {
          queryBuilder.where(`post.hashTags LIKE :${paramKey}`, { [paramKey]: `%${tag}%` });
        } else {
          queryBuilder.orWhere(`post.hashTags LIKE :${paramKey}`, { [paramKey]: `%${tag}%` });
        }
      });

      const posts = await queryBuilder.getMany();

      if (!posts || posts.length === 0) {
        return res.status(404).json({ message: 'No posts found with the given hashtags' });
      }

      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts with hashtags:', error);
      res.status(500).json({ message: 'Error fetching posts with hashtags', error });
    }
  }
}
