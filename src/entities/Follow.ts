// entities/Follow.ts
import { Entity, ManyToOne, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.followingRelations)
  follower: User;

  @ManyToOne(() => User, (user) => user.followerRelations)
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
