export interface Response {
  statusCode: number;
  headers: Record<string, unknown>;
  body: string;
}

export function makeResponse({
  body = {},
  statusCode = 200,
}: { statusCode?: number; body?: Record<string, unknown> } = {}): Response {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}
