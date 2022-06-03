import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<Comment> {
    return await this.commentService.create(createCommentInput);
  }

  @Query(() => [Comment], { name: 'comments' })
  async findAll(): Promise<Comment[]> {
    return await this.commentService.findAll();
  }

  @Query(() => Comment, { name: 'comment' })
  async findOne(@Args('id') id: string): Promise<Comment> {
    return await this.commentService.findOne(id);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args('id') id: string,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    return await this.commentService.update(id, updateCommentInput);
  }

  @Mutation(() => Comment)
  async removeComment(@Args('id') id: string): Promise<string> {
    return await this.commentService.remove(id);
  }
}
