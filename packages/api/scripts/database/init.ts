import { MongoClient } from 'mongodb';
import { teams, Team, matches, Match } from './data';

const uri = process.env['MONGO_URI'];
if (!uri) {
  throw new Error('MONGO_URI missing from env vars');
}

console.log('Connecting to database');
const client = new MongoClient(uri);
client.connect(async err => {
  if (err) {
    console.error('Could not connect to database');
    throw err;
  }

  const db = client.db('predictor');
  const collections = await db.listCollections().toArray();
  const collectionExists = (name: string) =>
    !!collections.find(x => x.name === name);

  console.log('Recreating teams');
  const team = db.collection<Team>('Team');

  if (collectionExists('Team')) {
    await team.drop();
  }
  await team.insertMany(teams);

  console.log('Recreating matches');
  const match = db.collection<Match>('Match');
  if (collectionExists('Match')) {
    await match.drop();
  }
  await match.insertMany(matches);

  console.log('Clearing predictions');
  const prediction = db.collection('Prediction');
  if (collectionExists('Prediction')) {
    await prediction.drop();
  }

  client.close();
  console.log('Finished :)');
});
