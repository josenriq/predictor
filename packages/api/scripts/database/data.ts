import {
  MatchLevel,
  MatchStatus,
  TournamentGroup,
} from '@predictor/domain/match';
import { uid } from 'uid';

export type Team = {
  _id: string;
  name: string;
};

export type Match = {
  _id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  startsAt: Date;
  level: MatchLevel;
  group?: TournamentGroup;
  stadium?: string;
  status: MatchStatus;
  score?: { home: number; away: number };
};

export const teams: Team[] = [
  {
    _id: 'qat',
    name: 'Qatar',
  },
  {
    _id: 'ecu',
    name: 'Ecuador',
  },
  {
    _id: 'sen',
    name: 'Senegal',
  },
  {
    _id: 'ned',
    name: 'Netherlands',
  },
  {
    _id: 'eng',
    name: 'England',
  },
  {
    _id: 'irn',
    name: 'Iran',
  },
  {
    _id: 'usa',
    name: 'USA',
  },
  {
    _id: 'wal',
    name: 'Wales',
  },
  {
    _id: 'arg',
    name: 'Argentina',
  },
  {
    _id: 'ksa',
    name: 'Saudi Arabia',
  },
  {
    _id: 'mex',
    name: 'Mexico',
  },
  {
    _id: 'pol',
    name: 'Poland',
  },
  {
    _id: 'fra',
    name: 'France',
  },
  {
    _id: 'aus',
    name: 'Australia',
  },
  {
    _id: 'den',
    name: 'Denmark',
  },
  {
    _id: 'tun',
    name: 'Tunisia',
  },
  {
    _id: 'esp',
    name: 'Spain',
  },
  {
    _id: 'crc',
    name: 'Costa Rica',
  },
  {
    _id: 'ger',
    name: 'Germany',
  },
  {
    _id: 'jpn',
    name: 'Japan',
  },
  {
    _id: 'bel',
    name: 'Belgium',
  },
  {
    _id: 'can',
    name: 'Canada',
  },
  {
    _id: 'mar',
    name: 'Morocco',
  },
  {
    _id: 'cro',
    name: 'Croatia',
  },
  {
    _id: 'bra',
    name: 'Brazil',
  },
  {
    _id: 'srb',
    name: 'Serbia',
  },
  {
    _id: 'swi',
    name: 'Switzerland',
  },
  {
    _id: 'cmr',
    name: 'Cameroon',
  },
  {
    _id: 'por',
    name: 'Portugal',
  },
  {
    _id: 'gha',
    name: 'Ghana',
  },
  {
    _id: 'uru',
    name: 'Uruguay',
  },
  {
    _id: 'kor',
    name: 'South Korea',
  },
];

const QATAR_2022 = 'qatar2022';

export const matches: Match[] = [
  {
    homeTeamId: 'qat',
    awayTeamId: 'ecu',
    startsAt: new Date(Date.UTC(2022, 10, 20, 16)),
    group: 'A',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'sen',
    awayTeamId: 'ned',
    startsAt: new Date(Date.UTC(2022, 10, 21, 16)),
    group: 'A',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'eng',
    awayTeamId: 'irn',
    startsAt: new Date(Date.UTC(2022, 10, 21, 13)),
    group: 'B',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'usa',
    awayTeamId: 'wal',
    startsAt: new Date(Date.UTC(2022, 10, 21, 19)),
    group: 'B',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'arg',
    awayTeamId: 'ksa',
    startsAt: new Date(Date.UTC(2022, 10, 22, 10)),
    group: 'C',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'mex',
    awayTeamId: 'pol',
    startsAt: new Date(Date.UTC(2022, 10, 22, 16)),
    group: 'C',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'fra',
    awayTeamId: 'aus',
    startsAt: new Date(Date.UTC(2022, 10, 22, 19)),
    group: 'D',
    stadium: 'Al Janoub Stadium',
  },
  {
    homeTeamId: 'den',
    awayTeamId: 'aus',
    startsAt: new Date(Date.UTC(2022, 10, 22, 13)),
    group: 'D',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'esp',
    awayTeamId: 'crc',
    startsAt: new Date(Date.UTC(2022, 10, 23, 16)),
    group: 'E',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'ger',
    awayTeamId: 'jpn',
    startsAt: new Date(Date.UTC(2022, 10, 23, 13)),
    group: 'E',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'bel',
    awayTeamId: 'can',
    startsAt: new Date(Date.UTC(2022, 10, 23, 19)),
    group: 'F',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'mar',
    awayTeamId: 'cro',
    startsAt: new Date(Date.UTC(2022, 10, 23, 10)),
    group: 'F',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'bra',
    awayTeamId: 'srb',
    startsAt: new Date(Date.UTC(2022, 10, 24, 19)),
    group: 'G',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'swi',
    awayTeamId: 'cmr',
    startsAt: new Date(Date.UTC(2022, 10, 24, 10)),
    group: 'G',
    stadium: 'Al Janoub Stadium',
  },
  {
    homeTeamId: 'por',
    awayTeamId: 'gha',
    startsAt: new Date(Date.UTC(2022, 10, 24, 16)),
    group: 'H',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'uru',
    awayTeamId: 'kor',
    startsAt: new Date(Date.UTC(2022, 10, 24, 13)),
    group: 'H',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'qat',
    awayTeamId: 'sen',
    startsAt: new Date(Date.UTC(2022, 10, 25, 13)),
    group: 'A',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'ned',
    awayTeamId: 'ecu',
    startsAt: new Date(Date.UTC(2022, 10, 25, 16)),
    group: 'A',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'eng',
    awayTeamId: 'usa',
    startsAt: new Date(Date.UTC(2022, 10, 25, 19)),
    group: 'B',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'wal',
    awayTeamId: 'irn',
    startsAt: new Date(Date.UTC(2022, 10, 25, 10)),
    group: 'B',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'arg',
    awayTeamId: 'mex',
    startsAt: new Date(Date.UTC(2022, 10, 26, 19)),
    group: 'C',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'pol',
    awayTeamId: 'ksa',
    startsAt: new Date(Date.UTC(2022, 10, 26, 13)),
    group: 'C',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'fra',
    awayTeamId: 'den',
    startsAt: new Date(Date.UTC(2022, 10, 26, 16)),
    group: 'D',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'tun',
    awayTeamId: 'aus',
    startsAt: new Date(Date.UTC(2022, 10, 26, 10)),
    group: 'D',
    stadium: 'Al Janoub Stadium',
  },
  {
    homeTeamId: 'esp',
    awayTeamId: 'ger',
    startsAt: new Date(Date.UTC(2022, 10, 27, 19)),
    group: 'E',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'jpn',
    awayTeamId: 'crc',
    startsAt: new Date(Date.UTC(2022, 10, 27, 10)),
    group: 'E',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'bel',
    awayTeamId: 'mar',
    startsAt: new Date(Date.UTC(2022, 10, 27, 13)),
    group: 'F',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'cro',
    awayTeamId: 'can',
    startsAt: new Date(Date.UTC(2022, 10, 27, 16)),
    group: 'F',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'bra',
    awayTeamId: 'swi',
    startsAt: new Date(Date.UTC(2022, 10, 28, 16)),
    group: 'G',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'cmr',
    awayTeamId: 'srb',
    startsAt: new Date(Date.UTC(2022, 10, 28, 10)),
    group: 'G',
    stadium: 'Al Janoub Stadium',
  },
  {
    homeTeamId: 'por',
    awayTeamId: 'uru',
    startsAt: new Date(Date.UTC(2022, 10, 28, 19)),
    group: 'H',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'kor',
    awayTeamId: 'gha',
    startsAt: new Date(Date.UTC(2022, 10, 28, 13)),
    group: 'H',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'ned',
    awayTeamId: 'qat',
    startsAt: new Date(Date.UTC(2022, 10, 29, 15)),
    group: 'A',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'ecu',
    awayTeamId: 'sen',
    startsAt: new Date(Date.UTC(2022, 10, 29, 15)),
    group: 'A',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'wal',
    awayTeamId: 'eng',
    startsAt: new Date(Date.UTC(2022, 10, 29, 19)),
    group: 'B',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'irn',
    awayTeamId: 'usa',
    startsAt: new Date(Date.UTC(2022, 10, 29, 19)),
    group: 'B',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'pol',
    awayTeamId: 'arg',
    startsAt: new Date(Date.UTC(2022, 10, 30, 19)),
    group: 'C',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'ksa',
    awayTeamId: 'mex',
    startsAt: new Date(Date.UTC(2022, 10, 30, 19)),
    group: 'C',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'tun',
    awayTeamId: 'fra',
    startsAt: new Date(Date.UTC(2022, 10, 30, 15)),
    group: 'D',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'aus',
    awayTeamId: 'den',
    startsAt: new Date(Date.UTC(2022, 10, 30, 15)),
    group: 'D',
    stadium: 'Al Janoub Stadium',
  },
  {
    homeTeamId: 'jpn',
    awayTeamId: 'esp',
    startsAt: new Date(Date.UTC(2022, 11, 1, 19)),
    group: 'E',
    stadium: 'Khalifa International Stadium',
  },
  {
    homeTeamId: 'crc',
    awayTeamId: 'ger',
    startsAt: new Date(Date.UTC(2022, 11, 1, 19)),
    group: 'E',
    stadium: 'Al Bayt Stadium',
  },
  {
    homeTeamId: 'cro',
    awayTeamId: 'bel',
    startsAt: new Date(Date.UTC(2022, 11, 1, 15)),
    group: 'F',
    stadium: 'Ahmad bin Ali Stadium',
  },
  {
    homeTeamId: 'can',
    awayTeamId: 'mar',
    startsAt: new Date(Date.UTC(2022, 11, 1, 15)),
    group: 'F',
    stadium: 'Al Thumama Stadium',
  },
  {
    homeTeamId: 'cmr',
    awayTeamId: 'bra',
    startsAt: new Date(Date.UTC(2022, 11, 2, 19)),
    group: 'G',
    stadium: 'Lusail Iconic Stadium',
  },
  {
    homeTeamId: 'srb',
    awayTeamId: 'swi',
    startsAt: new Date(Date.UTC(2022, 11, 2, 19)),
    group: 'G',
    stadium: 'Stadium 974',
  },
  {
    homeTeamId: 'kor',
    awayTeamId: 'por',
    startsAt: new Date(Date.UTC(2022, 11, 2, 15)),
    group: 'H',
    stadium: 'Education City Stadium',
  },
  {
    homeTeamId: 'gha',
    awayTeamId: 'uru',
    startsAt: new Date(Date.UTC(2022, 11, 2, 15)),
    group: 'H',
    stadium: 'Al Janoub Stadium',
  },
].map(
  record =>
    ({
      ...record,
      _id: uid(),
      tournamentId: QATAR_2022,
      level: MatchLevel.GroupStage,
      status: MatchStatus.Unstarted,
    } as Match),
);
