import { SquareClient, SquareEnvironment } from 'square';
import type { H3Event } from 'h3';

let _client: SquareClient | null = null;

export function useSquareClient(event: H3Event): SquareClient {
  if (_client) return _client;
  const config = useRuntimeConfig(event);
  _client = new SquareClient({
    token: config.squareAccessToken as string,
    environment: config.squareEnvironment === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  });
  return _client;
}
