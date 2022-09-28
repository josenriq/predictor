import { Connection, ConnectOptions, createConnection } from 'mongoose';

export interface Connections {
  [key: string]: Connection;
}

const connections: Connections = {};

export async function connectToDatabase(
  uri: string,
  options?: ConnectOptions,
): Promise<Connection> {
  let connection = connections[uri];

  if (connection == null) {
    if (!uri) throw new Error('mongo db uri was not provided');

    connection = await createConnection(uri, options ?? {});

    connections[uri] = connection;
  }

  return connection;
}
