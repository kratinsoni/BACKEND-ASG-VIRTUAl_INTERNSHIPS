import { Router } from 'express';
import { PostController } from '../controllers/post.controller';

export const postRouter = Router();

const postController = new PostController();

postRouter.get('/', postController.getAllPosts.bind(postController));

postRouter.get('/:id', postController.getPostById.bind(postController));

postRouter.post('/', postController.createPost.bind(postController));

postRouter.put('/:id', postController.updatePost.bind(postController));

postRouter.delete('/:id', postController.deletePost.bind(postController));

postRouter.post('/:id/like', postController.likePost.bind(postController));

postRouter.post('/:id/unlike', postController.unlikePost.bind(postController));

postRouter.get('/feed/:id', postController.getFeed.bind(postController));

postRouter.get('/:id/likes', postController.getPostLikes.bind(postController));

postRouter.get('/hashtags/:hashtag', postController.getPostsWithHashtags.bind(postController));
