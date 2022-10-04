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
  Score: any;
  Url: string;
};

export type Match = {
  awayTeam: Team;
  group?: Maybe<Scalars['String']>;
  homeTeam: Team;
  id: Scalars['ID'];
  isOpenForPredictions: Scalars['Boolean'];
  level: MatchLevel;
  prediction?: Maybe<Prediction>;
  score?: Maybe<Scalars['Score']>;
  stadium?: Maybe<Scalars['String']>;
  startsAt: Scalars['DateTime'];
  status: MatchStatus;
  time?: Maybe<Scalars['String']>;
};

export enum MatchLevel {
  Final = 'Final',
  GroupStage = 'GroupStage',
  QuaterFinal = 'QuaterFinal',
  Regular = 'Regular',
  RoundOf16 = 'RoundOf16',
  SemiFinal = 'SemiFinal',
  ThirdPlace = 'ThirdPlace',
}

export enum MatchStatus {
  Cancelled = 'Cancelled',
  Finished = 'Finished',
  Ongoing = 'Ongoing',
  Postponed = 'Postponed',
  Unstarted = 'Unstarted',
}

export type Mutation = {
  savePrediction?: Maybe<SavePredictionOutput>;
};

export type MutationSavePredictionArgs = {
  input: SavePredictionInput;
};

export type Prediction = {
  id: Scalars['ID'];
  outcome?: Maybe<PredictionOutcome>;
  points?: Maybe<Scalars['Int']>;
  score: Scalars['Score'];
};

export enum PredictionOutcome {
  Correct = 'Correct',
  Exact = 'Exact',
  Incorrect = 'Incorrect',
}

export type Query = {
  matches: Array<Match>;
  me?: Maybe<User>;
};

export type SavePredictionInput = {
  matchId: Scalars['ID'];
  score: Scalars['Score'];
};

export type SavePredictionOutput = {
  prediction: Prediction;
};

export type Team = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type User = {
  id: Scalars['ID'];
  name: Scalars['String'];
  picture?: Maybe<Scalars['Url']>;
};
