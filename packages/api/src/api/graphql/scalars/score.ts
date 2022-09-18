import { GraphQLScalarType, Kind, ValueNode, GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { Score } from '@predictor/domain/score';
import { parseObject } from './object-parser';

type ScoreObj = {
  home: number;
  away: number;
};

function isScoreObj(value: unknown): value is ScoreObj {
  if (value == null) return false;
  return (value as any)['home'] >= 0 && (value as any)['away'] >= 0;
}

function decode(value: unknown): Score {
  if (value instanceof Score) return value;
  if (isScoreObj(value)) {
    return Score.decode(value);
  }
  throw new Error('Invalid format for score');
}

function encode(value: unknown): ScoreObj {
  return Score.encode(decode(value));
}

export const ScoreScalar = new GraphQLScalarType({
  name: 'Score',
  description: 'An object representing a score with home and away values.',
  parseValue(value: unknown): Score {
    return decode(value);
  },
  serialize(value: unknown): ScoreObj {
    return encode(value);
  },
  parseLiteral(ast: ValueNode, variables: any): Score {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError(
        `Score can be represented by an object with home and away fields, but got ${ast.kind} type instead.`,
      );
    }
    return decode(parseObject(ast, variables));
  },
});

export const ScoreTypeDef = gql`
  scalar Score
`;

export const ScoreResolver = { Score: ScoreScalar };
