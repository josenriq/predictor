import { Maybe } from '@predictor/core';
import { Id } from '@predictor/domain';
import { Team, TeamStorage } from '@predictor/domain/team';

const TEAMS = [
  {
    id: 'qat',
    name: 'Qatar',
  },
  {
    id: 'ecu',
    name: 'Ecuador',
  },
  {
    id: 'sen',
    name: 'Senegal',
  },
  {
    id: 'ned',
    name: 'Netherlands',
  },
  {
    id: 'eng',
    name: 'England',
  },
  {
    id: 'ira',
    name: 'Iran',
  },
  {
    id: 'usa',
    name: 'USA',
  },
  {
    id: 'wal',
    name: 'Wales',
  },
  {
    id: 'arg',
    name: 'Argentina',
  },
  {
    id: 'sau',
    name: 'Saudi Arabia',
  },
  {
    id: 'mex',
    name: 'Mexico',
  },
  {
    id: 'pol',
    name: 'Poland',
  },
  {
    id: 'fra',
    name: 'France',
  },
  {
    id: 'aus',
    name: 'Australia',
  },
  {
    id: 'den',
    name: 'Denmark',
  },
  {
    id: 'tun',
    name: 'Tunisia',
  },
  {
    id: 'spa',
    name: 'Spain',
  },
  {
    id: 'crc',
    name: 'Costa Rica',
  },
  {
    id: 'ger',
    name: 'Germany',
  },
  {
    id: 'jap',
    name: 'Japan',
  },
  {
    id: 'bel',
    name: 'Belgium',
  },
  {
    id: 'can',
    name: 'Canada',
  },
  {
    id: 'mor',
    name: 'Morocco',
  },
  {
    id: 'cro',
    name: 'Croatia',
  },
  {
    id: 'bra',
    name: 'Brazil',
  },
  {
    id: 'ser',
    name: 'Serbia',
  },
  {
    id: 'swz',
    name: 'Switzerland',
  },
  {
    id: 'cam',
    name: 'Cameroon',
  },
  {
    id: 'por',
    name: 'Portugal',
  },
  {
    id: 'gha',
    name: 'Ghana',
  },
  {
    id: 'uru',
    name: 'Uruguay',
  },
  {
    id: 'kor',
    name: 'South Korea',
  },
];

export class TeamModel implements TeamStorage {
  async find(id: Id): Promise<Maybe<Team>> {
    const record = TEAMS.find(team => team.id === id.toString());
    return record ? new Team(id, record.name) : void 0;
  }
}
