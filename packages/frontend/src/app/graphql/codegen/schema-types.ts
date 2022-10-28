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
  JSON: any;
  Score: any;
  Url: string;
};

export type AbandonPartyInput = {
  partyId: Scalars['ID'];
};

export type CreatePartyInput = {
  name: Scalars['String'];
};

export type CreatePartyOutput = {
  party: Party;
};

export type JoinPartyInput = {
  partyId: Scalars['ID'];
};

export type ListRankingsInput = {
  pageNumber?: InputMaybe<Scalars['Int']>;
  pageSize?: InputMaybe<Scalars['Int']>;
  partyId?: InputMaybe<Scalars['ID']>;
};

export type Match = {
  awayTeam: Team;
  group?: Maybe<Scalars['String']>;
  homeTeam: Team;
  id: Scalars['ID'];
  isOpenForPredictions: Scalars['Boolean'];
  prediction?: Maybe<Prediction>;
  score?: Maybe<Scalars['Score']>;
  stadium?: Maybe<Scalars['String']>;
  stage: MatchStage;
  startsAt: Scalars['DateTime'];
  status: MatchStatus;
  time?: Maybe<Scalars['String']>;
};

export enum MatchStage {
  Final = 'Final',
  Group = 'Group',
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
  abandonParty: SuccessOutput;
  createParty: CreatePartyOutput;
  joinParty: SuccessOutput;
  markHasSeenTutorial: SuccessOutput;
  savePrediction: SavePredictionOutput;
};

export type MutationAbandonPartyArgs = {
  input: AbandonPartyInput;
};

export type MutationCreatePartyArgs = {
  input: CreatePartyInput;
};

export type MutationJoinPartyArgs = {
  input: JoinPartyInput;
};

export type MutationSavePredictionArgs = {
  input: SavePredictionInput;
};

export type Party = {
  id: Scalars['ID'];
  name: Scalars['String'];
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
  me?: Maybe<SessionUser>;
  rankings: RankingsPage;
};

export type QueryRankingsArgs = {
  input: ListRankingsInput;
};

export type RankingsPage = {
  hasMore: Scalars['Boolean'];
  pageNumber: Scalars['Int'];
  pageSize: Scalars['Int'];
  results: Array<TournamentEntry>;
};

export type SavePredictionInput = {
  matchId: Scalars['ID'];
  score: Scalars['Score'];
};

export type SavePredictionOutput = {
  prediction: Prediction;
};

export type SessionUser = {
  hasSeenTutorial: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  parties: Array<Party>;
  picture?: Maybe<Scalars['Url']>;
  points: Scalars['Int'];
};

export type SuccessOutput = {
  success: Scalars['Boolean'];
};

export type Team = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type TournamentEntry = {
  id: Scalars['ID'];
  points: Scalars['Int'];
  user: User;
};

export type User = {
  id: Scalars['ID'];
  name: Scalars['String'];
  picture?: Maybe<Scalars['Url']>;
};
