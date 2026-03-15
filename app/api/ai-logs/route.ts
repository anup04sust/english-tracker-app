import { NextRequest, NextResponse } from 'next/server';
import { searchAILogs, getElasticsearchClient } from '@/lib/elasticsearch';

export async function GET(req: NextRequest) {
  try {
    const client = getElasticsearchClient();
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Elasticsearch not configured' 
      }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const endpoint = searchParams.get('endpoint');
    const provider = searchParams.get('provider');
    const from = searchParams.get('from') || '0';
    const size = searchParams.get('size') || '50';

    // Build Elasticsearch query
    const must: any[] = [];

    if (userId) {
      must.push({ term: { userId } });
    }

    if (endpoint) {
      must.push({ term: { endpoint } });
    }

    if (provider) {
      must.push({ term: { provider } });
    }

    const query = {
      from: parseInt(from),
      size: parseInt(size),
      sort: [{ timestamp: { order: 'desc' } }],
      query: must.length > 0 ? { bool: { must } } : { match_all: {} },
    };

    const result = await searchAILogs(query);

    // Format response
    const logs = result.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));

    return NextResponse.json({
      success: true,
      total: result.body.hits.total.value,
      logs,
    });

  } catch (error) {
    console.error('AI logs API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch AI logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getElasticsearchClient();
    
    if (!client) {
      return NextResponse.json({ 
        error: 'Elasticsearch not configured' 
      }, { status: 503 });
    }

    const body = await req.json();
    const { userId, startDate, endDate, aggregation } = body;

    // Build aggregation query for statistics
    const query: any = {
      size: 0,
      query: {
        bool: {
          must: [],
        },
      },
      aggs: {},
    };

    if (userId) {
      query.query.bool.must.push({ term: { userId } });
    }

    if (startDate || endDate) {
      const rangeQuery: any = { timestamp: {} };
      if (startDate) rangeQuery.timestamp.gte = startDate;
      if (endDate) rangeQuery.timestamp.lte = endDate;
      query.query.bool.must.push({ range: rangeQuery });
    }

    // Add aggregations
    if (aggregation === 'by-provider') {
      query.aggs = {
        providers: {
          terms: { field: 'provider' },
          aggs: {
            avg_latency: { avg: { field: 'response.latency' } },
            total_requests: { value_count: { field: 'timestamp' } },
          },
        },
      };
    } else if (aggregation === 'by-endpoint') {
      query.aggs = {
        endpoints: {
          terms: { field: 'endpoint' },
          aggs: {
            avg_latency: { avg: { field: 'response.latency' } },
            success_rate: {
              filter: { term: { 'response.status': 200 } },
            },
          },
        },
      };
    } else if (aggregation === 'by-user') {
      query.aggs = {
        users: {
          terms: { field: 'userId' },
          aggs: {
            total_requests: { value_count: { field: 'timestamp' } },
            avg_latency: { avg: { field: 'response.latency' } },
          },
        },
      };
    } else {
      // Default: timeline aggregation
      query.aggs = {
        requests_over_time: {
          date_histogram: {
            field: 'timestamp',
            calendar_interval: 'day',
          },
          aggs: {
            avg_latency: { avg: { field: 'response.latency' } },
          },
        },
      };
    }

    const result = await searchAILogs(query);

    return NextResponse.json({
      success: true,
      aggregations: result.body.aggregations,
    });

  } catch (error) {
    console.error('AI logs aggregation error:', error);
    return NextResponse.json({ 
      error: 'Failed to aggregate AI logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
