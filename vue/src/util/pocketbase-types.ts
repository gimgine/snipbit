/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from 'pocketbase';
import type { RecordService } from 'pocketbase';

export enum Collections {
  Comments = 'comments',
  Edits = 'edits',
  Following = 'following',
  Languages = 'languages',
  Likes = 'likes',
  Posts = 'posts',
  Snippets = 'snippets',
  Users = 'users'
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString;
  created: IsoDateString;
  updated: IsoDateString;
  collectionId: string;
  collectionName: Collections;
  expand?: T;
};

export type AuthSystemFields<T = never> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type CommentsRecord = {
  comment?: string;
  post?: RecordIdString;
  user?: RecordIdString;
};

export type EditsRecord = {
  comment?: string;
  content?: string;
  originalPost?: RecordIdString;
  user?: RecordIdString;
};

export type FollowingRecord = {
  isFollowing?: RecordIdString;
  user?: RecordIdString;
};

export type LanguagesRecord = {
  isRunnable?: boolean;
  monacoName?: string;
  name?: string;
};

export type LikesRecord = {
  post?: RecordIdString;
  user?: RecordIdString;
};

export enum PostsTypeOptions {
  'code' = 'code',
  'htmlcssjs' = 'htmlcssjs',
  'text' = 'text',
  'codesandbox' = 'codesandbox',
  'image' = 'image'
}
export type PostsRecord = {
  caption?: string;
  snippet?: RecordIdString;
  type?: PostsTypeOptions;
  user: RecordIdString;
};

export type SnippetsRecord = {
  content?: string;
  customLanguage?: string;
  forkedFrom?: RecordIdString;
  language?: RecordIdString;
  runnable?: boolean;
  title: string;
  user: RecordIdString;
};

export type UsersRecord = {
  avatarUrl?: string;
  bio?: string;
  github?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type CommentsResponse<Texpand = unknown> = Required<CommentsRecord> & BaseSystemFields<Texpand>;
export type EditsResponse<Texpand = unknown> = Required<EditsRecord> & BaseSystemFields<Texpand>;
export type FollowingResponse<Texpand = unknown> = Required<FollowingRecord> & BaseSystemFields<Texpand>;
export type LanguagesResponse<Texpand = unknown> = Required<LanguagesRecord> & BaseSystemFields<Texpand>;
export type LikesResponse<Texpand = unknown> = Required<LikesRecord> & BaseSystemFields<Texpand>;
export type PostsResponse<Texpand = unknown> = Required<PostsRecord> & BaseSystemFields<Texpand>;
export type SnippetsResponse<Texpand = unknown> = Required<SnippetsRecord> & BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  comments: CommentsRecord;
  edits: EditsRecord;
  following: FollowingRecord;
  languages: LanguagesRecord;
  likes: LikesRecord;
  posts: PostsRecord;
  snippets: SnippetsRecord;
  users: UsersRecord;
};

export type CollectionResponses = {
  comments: CommentsResponse;
  edits: EditsResponse;
  following: FollowingResponse;
  languages: LanguagesResponse;
  likes: LikesResponse;
  posts: PostsResponse;
  snippets: SnippetsResponse;
  users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'comments'): RecordService<CommentsResponse>;
  collection(idOrName: 'edits'): RecordService<EditsResponse>;
  collection(idOrName: 'following'): RecordService<FollowingResponse>;
  collection(idOrName: 'languages'): RecordService<LanguagesResponse>;
  collection(idOrName: 'likes'): RecordService<LikesResponse>;
  collection(idOrName: 'posts'): RecordService<PostsResponse>;
  collection(idOrName: 'snippets'): RecordService<SnippetsResponse>;
  collection(idOrName: 'users'): RecordService<UsersResponse>;
};
