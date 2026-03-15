import { Client } from '@elastic/elasticsearch';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client | null {
  try {
    if (!process.env.ELASTICSEARCH_NODE) {
      console.warn('Elasticsearch not configured - ELASTICSEARCH_NODE not set');
      return null;
    }

    if (!esClient) {
      esClient = new Client({
        node: process.env.ELASTICSEARCH_NODE,
        tls: {
          rejectUnauthorized: false, // For DDEV self-signed certs
        },
      });
    }

    return esClient;
  } catch (error) {
    console.error('Failed to initialize Elasticsearch client:', error);
    return null;
  }
}

export interface AILogEntry {
  timestamp: string;
  userId: string;
  endpoint: string;
  provider: string;
  model: string;
  request: {
    method: string;
    body: any;
    headers?: Record<string, string>;
  };
  response: {
    status: number;
    body: any;
    latency: number; // in milliseconds
  };
  error?: string;
}

export async function logAIRequest(logEntry: AILogEntry): Promise<void> {
  const client = getElasticsearchClient();
  
  if (!client) {
    console.log('Elasticsearch not available - skipping log');
    return;
  }

  const indexName = process.env.ELASTICSEARCH_INDEX || 'ai-api-logs';

  try {
    await client.index({
      index: indexName,
      body: logEntry,
    });
  } catch (error) {
    console.error('Failed to log to Elasticsearch:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

export async function searchAILogs(query: any): Promise<any> {
  const client = getElasticsearchClient();
  
  if (!client) {
    throw new Error('Elasticsearch not configured');
  }

  const indexName = process.env.ELASTICSEARCH_INDEX || 'ai-api-logs';

  try {
    const result = await client.search({
      index: indexName,
      body: query,
    });
    return result;
  } catch (error) {
    console.error('Failed to search Elasticsearch:', error);
    throw error;
  }
}

// Initialize index with mapping on first use
export async function initializeElasticsearchIndex(): Promise<void> {
  const client = getElasticsearchClient();
  
  if (!client) {
    return;
  }

  const indexName = process.env.ELASTICSEARCH_INDEX || 'ai-api-logs';

  try {
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (!indexExists) {
      await client.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              timestamp: { type: 'date' },
              userId: { type: 'keyword' },
              endpoint: { type: 'keyword' },
              provider: { type: 'keyword' },
              model: { type: 'keyword' },
              request: {
                properties: {
                  method: { type: 'keyword' },
                  body: { type: 'object', enabled: false },
                  headers: { type: 'object', enabled: false },
                },
              },
              response: {
                properties: {
                  status: { type: 'integer' },
                  body: { type: 'object', enabled: false },
                  latency: { type: 'long' },
                },
              },
              error: { type: 'text' },
            },
          },
        } as any,
      });
      console.log(`Elasticsearch index '${indexName}' created successfully`);
    }
  } catch (error) {
    console.error('Failed to initialize Elasticsearch index:', error);
  }
}
