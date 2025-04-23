import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Post } from './Post';
import { Follow } from './Follow';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @OneToMany(() => Post, (post) => post.auther)
  posts: Post[];

  // Users this user is following
  // inside User entity
  @OneToMany(() => Follow, (follow) => follow.follower)
  followingRelations: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followerRelations: Follow[];

  @ManyToMany(() => Post, (post) => post.likes)
  likedPosts: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
