import { NextRequest, NextResponse } from 'next/server';
import { searchAILogs, getElasticsearchClient } from '@/lib/elasticsearch';

export async function GET(req: NextRequest) {
  try {
    const client = getElasticsearchClient();
    
    if (!client) {
      return NextResponse.json({ 
        success: false,
        error: 'Elasticsearch not configured',
        logs: []
      }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    
    // Parameters
    const userId = searchParams.get('userId');
    const endpoint = searchParams.get('endpoint');
    const provider = searchParams.get('provider');
    const model = searchParams.get('model');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build Elasticsearch query
    const must: any[] = [];
    const filter: any[] = [];

    // User filter
    if (userId) {
      must.push({ match: { userId } });
    }

    // Endpoint filter
    if (endpoint) {
      must.push({ match: { endpoint } });
    }

    // Provider filter
    if (provider) {
      must.push({ term: { 'provider.keyword': provider } });
    }

    // Model filter
    if (model) {
      must.push({ term: { 'model.keyword': model } });
    }

    // Status filter
    if (status) {
      must.push({ term: { 'response.status': parseInt(status) } });
    }

    // Date range filter
    if (startDate || endDate) {
      const rangeQuery: any = { timestamp: {} };
      if (startDate) rangeQuery.timestamp.gte = startDate;
      if (endDate) rangeQuery.timestamp.lte = endDate;
      filter.push({ range: rangeQuery });
    }

    const query = {
      from: offset,
      size: Math.min(limit, 100), // Max 100 logs per request
      sort: [{ [sortBy]: { order: sortOrder } }],
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filter.length > 0 ? filter : undefined,
        },
      },
    };

    let result;
    try {
      result = await searchAILogs(query);
    } catch (searchError: any) {
      // Handle index not found error
      if (searchError.message?.includes('index_not_found')) {
        return NextResponse.json({
          success: true,
          stats: {
            totalLogs: 0,
            returned: 0,
            offset: 0,
            limit,
            hasMore: false,
            avgLatency: 0,
            errorCount: 0,
            successRate: 0,
          },
          logs: [],
          message: 'No logs yet - index will be created on first log entry'
        });
      }
      throw searchError;
    }

    // Handle both old and new Elasticsearch client response formats
    const hits = result.body?.hits || result.hits;
    
    if (!hits) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Elasticsearch response',
        logs: []
      }, { status: 500 });
    }

    // Format response
    const logs = hits.hits.map((hit: any) => ({
      id: hit._id,
      timestamp: hit._source.timestamp,
      userId: hit._source.userId,
      endpoint: hit._source.endpoint,
      provider: hit._source.provider,
      model: hit._source.model,
      request: hit._source.request,
      response: {
        status: hit._source.response?.status,
        latency: hit._source.response?.latency,
        body: hit._source.response?.body,
      },
      error: hit._source.error,
    }));

    // Calculate statistics
    const totalValue = hits.total?.value || hits.total || 0;
    const stats = {
      totalLogs: totalValue,
      returned: logs.length,
      offset,
      limit,
      hasMore: totalValue > offset + logs.length,
    };

    // Calculate average latency
    const latencies = logs
      .filter(log => log.response.latency)
      .map(log => log.response.latency);
    
    const avgLatency = latencies.length > 0
      ? Math.round(latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length)
      : 0;

    // Count errors
    const errorCount = logs.filter(log => log.error || log.response.status >= 400).length;

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        avgLatency,
        errorCount,
        successRate: logs.length > 0 
          ? Math.round(((logs.length - errorCount) / logs.length) * 100) 
          : 0,
      },
      logs,
    });

  } catch (error) {
    console.error('Get logs API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch logs',
      details: error instanceof Error ? error.message : String(error),
      logs: []
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getElasticsearchClient();
    
    if (!client) {
      return NextResponse.json({ 
        success: false,
        error: 'Elasticsearch not configured'
      }, { status: 503 });
    }

    const body = await req.json();
    const { 
      userId, 
      endpoint, 
      provider,
      model,
      startDate, 
      endDate, 
      aggregationType = 'timeline',
      interval = 'day',
    } = body;

    // Build aggregation query
    const must: any[] = [];

    if (userId) {
      must.push({ match: { userId } });
    }

    if (endpoint) {
      must.push({ match: { endpoint } });
    }

    if (provider) {
      must.push({ term: { provider: provider.toLowerCase() } });
    }

    if (model) {
      must.push({ term: { model } });
    }

    if (startDate || endDate) {
      const rangeQuery: any = { timestamp: {} };
      if (startDate) rangeQuery.timestamp.gte = startDate;
      if (endDate) rangeQuery.timestamp.lte = endDate;
      must.push({ range: rangeQuery });
    }

    const query: any = {
      size: 0,
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
        },
      },
      aggs: {},
    };

    // Build aggregations based on type
    switch (aggregationType) {
      case 'timeline':
        query.aggs = {
          requests_over_time: {
            date_histogram: {
              field: 'timestamp',
              calendar_interval: interval,
            },
            aggs: {
              avg_latency: { avg: { field: 'response.latency' } },
              success_count: {
                filter: { range: { 'response.status': { gte: 200, lt: 300 } } },
              },
              error_count: {
                filter: { range: { 'response.status': { gte: 400 } } },
              },
            },
          },
        };
        break;

      case 'by-provider':
        query.aggs = {
          providers: {
            terms: { field: 'provider.keyword', size: 10 },
            aggs: {
              avg_latency: { avg: { field: 'response.latency' } },
              total_requests: { value_count: { field: 'timestamp' } },
              models: {
                terms: { field: 'model.keyword', size: 5 },
              },
            },
          },
        };
        break;

      case 'by-endpoint':
        query.aggs = {
          endpoints: {
            terms: { field: 'endpoint.keyword', size: 10 },
            aggs: {
              avg_latency: { avg: { field: 'response.latency' } },
              success_count: {
                filter: { range: { 'response.status': { gte: 200, lt: 300 } } },
              },
              error_count: {
                filter: { range: { 'response.status': { gte: 400 } } },
              },
            },
          },
        };
        break;

      case 'by-model':
        query.aggs = {
          models: {
            terms: { field: 'model.keyword', size: 10 },
            aggs: {
              avg_latency: { avg: { field: 'response.latency' } },
              total_requests: { value_count: { field: 'timestamp' } },
              providers: {
                terms: { field: 'provider.keyword', size: 3 },
              },
            },
          },
        };
        break;

      case 'by-user':
        query.aggs = {
          users: {
            terms: { field: 'userId.keyword', size: 20 },
            aggs: {
              total_requests: { value_count: { field: 'timestamp' } },
              avg_latency: { avg: { field: 'response.latency' } },
              endpoints_used: {
                terms: { field: 'endpoint.keyword', size: 5 },
              },
            },
          },
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid aggregation type',
        }, { status: 400 });
    }

    let result;
    try {
      result = await searchAILogs(query);
    } catch (searchError: any) {
      // Handle index not found error
      if (searchError.message?.includes('index_not_found')) {
        return NextResponse.json({
          success: true,
          aggregationType,
          total: 0,
          aggregations: {},
          message: 'No logs yet - index will be created on first log entry'
        });
      }
      throw searchError;
    }

    // Handle both old and new Elasticsearch client response formats
    const totalValue = result.body?.hits?.total?.value || result.hits?.total?.value || result.hits?.total || 0;
    const aggregations = result.body?.aggregations || result.aggregations || {};

    return NextResponse.json({
      success: true,
      aggregationType,
      total: totalValue,
      aggregations,
    });

  } catch (error) {
    console.error('Logs aggregation error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to aggregate logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
