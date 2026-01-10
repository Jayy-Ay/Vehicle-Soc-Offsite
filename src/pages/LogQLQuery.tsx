import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/AppLayout';
import { 
  Terminal, 
  Play, 
  History, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Database,
  Clock,
  FileText,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

// Database configuration
const DATABASE_TYPE = 'PostgreSQL';
const DATABASE_VERSION = '15+';

// Database schema configuration
const DATABASE_SCHEMA = [
  { table: 'vehicles', description: 'Vehicle data & TEE status' },
  { table: 'alerts', description: 'Security alerts' },
  { table: 'threat_metrics', description: 'Historical threat data' },
];

interface QueryResult {
  id: string;
  query: string;
  result: any[];
  error?: string;
  executedAt: Date;
  executionTime: number;
}

const LogQLQuery = () => {
  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);

  // Predefined LogQL-style queries adapted for Supabase
  const exampleQueries = [
    {
      name: "All Alerts",
      query: `SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10;`,
      description: "View the latest 10 security alerts"
    },
    {
      name: "All Vehicles", 
      query: `SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 10;`,
      description: "View all registered vehicles and their TEE status"
    },
    {
      name: "Critical Alerts",
      query: `SELECT * FROM alerts WHERE severity = 'high' ORDER BY created_at DESC;`,
      description: "Find all critical security alerts"
    },
    {
      name: "Vehicle Count by Status",
      query: `SELECT tee_status, COUNT(*) as count FROM vehicles GROUP BY tee_status;`,
      description: "Count vehicles grouped by TEE status"
    },
    {
      name: "Recent Data Check",
      query: `SELECT 'alerts' as table_name, COUNT(*) as row_count FROM alerts
UNION ALL
SELECT 'vehicles' as table_name, COUNT(*) as row_count FROM vehicles;`,
      description: "Check if tables have data"
    }
  ];

  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // First, try to use the execute_sql function for raw SQL
      const { data, error } = await supabase.rpc('execute_sql', { query_text: query });
      
      const executionTime = Date.now() - startTime;
      const result: QueryResult = {
        id: Date.now().toString(),
        query,
        result: data || [],
        error: error?.message,
        executedAt: new Date(),
        executionTime
      };

      setCurrentResult(result);
      setQueryHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 queries
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const result: QueryResult = {
        id: Date.now().toString(),
        query,
        result: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred. Make sure the execute_sql function is created in your database.',
        executedAt: new Date(),
        executionTime
      };

      setCurrentResult(result);
      setQueryHistory(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setIsExecuting(false);
    }
  };

  const loadExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const loadHistoryQuery = (historyResult: QueryResult) => {
    setQuery(historyResult.query);
    setCurrentResult(historyResult);
  };

  const formatResultForDisplay = (result: any[]) => {
    if (!result || result.length === 0) return 'No results found.';
    
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return 'Error formatting results.';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Advanced LogQL Query
            </h1>
            <p className="text-muted-foreground">
              Obtain specific data with advanced database LogQL querying
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {DATABASE_TYPE} {DATABASE_VERSION}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Query Input Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Query Editor */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  SQL Query Editor
                </CardTitle>
                <CardDescription>
                  Write and execute SQL queries against the vehicle security database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="-- Enter your SQL query here
                                    SELECT * FROM alerts WHERE severity = 'high';"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="font-mono text-sm min-h-[200px] bg-muted/50"
                  />
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={executeQuery} 
                      disabled={!query.trim() || isExecuting}
                      className="flex items-center gap-2"
                    >
                      {isExecuting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Execute Query
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Save className="h-3 w-3" />
                      Save Query
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {currentResult && (
              <Card className="bg-gradient-surface border-border shadow-soc">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {currentResult.error ? (
                        <AlertCircle className="h-4 w-4 text-critical" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                      Query Results
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {currentResult.executionTime}ms
                      </span>
                      <span>{currentResult.result.length} rows</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentResult.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{currentResult.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto">
                        {formatResultForDisplay(currentResult.result)}
                      </pre>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Example Queries */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Example Queries
                </CardTitle>
                <CardDescription>
                  Try out common queries for analysis tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleQueries.map((example, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => loadExampleQuery(example.query)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                    </Button>
                    {index < exampleQueries.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Query History */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Query History
                </CardTitle>
                <CardDescription>
                  Recent queries and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {queryHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No queries executed yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {queryHistory.map((historyItem) => (
                        <Button
                          key={historyItem.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => loadHistoryQuery(historyItem)}
                        >
                          <div className="text-left w-full">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1">
                                {historyItem.error ? (
                                  <AlertCircle className="h-3 w-3 text-critical" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 text-success" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {historyItem.executedAt.toLocaleTimeString()}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {historyItem.executionTime}ms
                              </span>
                            </div>
                            <div className="font-mono text-xs truncate">
                              {historyItem.query.split('\n')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {historyItem.error ? 'Error' : `${historyItem.result.length} rows`}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Database Schema Info */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Available Tables:</div>
                  <div className="space-y-1 text-xs">
                    {DATABASE_SCHEMA.map((schema, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-mono">{schema.table}</span>
                        <span className="text-muted-foreground">{schema.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Instructions
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Setup Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  <p className="mb-2">To use advanced SQL queries, create the execute_sql function in your Supabase database:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open Supabase Dashboard</li>
                    <li>Go to SQL Editor</li>
                    <li>Run the SQL from SUPABASE_SQL_SETUP.md</li>
                  </ol>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LogQLQuery;