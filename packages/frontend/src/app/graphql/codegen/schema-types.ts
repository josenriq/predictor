export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
};

/** Input to get a the details of a user */
export type GetUserInput = {
  /** The id of the user */
  userId: Scalars['ID'];
};

export type Query = {
  /** Returns the currently signed-in user */
  me?: Maybe<User>;
  /** Returns a user */
  user: User;
};

export type QueryUserArgs = {
  input: GetUserInput;
};

/** An end-user of the app */
export type User = {
  /** The id of the user */
  id: Scalars['ID'];
  /** The name of the user */
  name: Scalars['String'];
};
