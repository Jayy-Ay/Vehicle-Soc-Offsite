import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AppLayout } from '@/components/AppLayout';
import { 
  Play, 
  History, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Database,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database as db } from "@/lib/database.types";
import { VehiclesTable, AlertsTable, ThreatsTable } from "@/components/QueryTable";
import { parseLogQlMut } from "@/hooks/api/useVehicles";

// Database configuration
const DATABASE_TYPE = 'PostgreSQL';
const DATABASE_VERSION = '15+';

// Database schema configuration
const DATABASE_SCHEMA = [
  { table: 'vehicles', description: 'Vehicle data & TEE status' },
  { table: 'alerts', description: 'Security alerts' },
  { table: 'threat_metrics', description: 'Historical threat data' },
];

type TableName = "vehicles" | "alerts" | "threat_metrics"

interface QueryResult {
  id: string;
  query: string;
  table: TableName
  result: any[];
  error?: string;
  executedAt: Date;
  executionTime: number;
}

function ResultTable({ table, rows, }: { table: "vehicles" | "alerts" | "threat_metrics" ; rows: any[] }) {
  switch (table) {
    case "vehicles":
      return <VehiclesTable vehicles={rows} />
    case "alerts":
      return <AlertsTable alerts={rows} />
    case "threat_metrics":
      return <ThreatsTable threats={rows} />
    default:
      return (
        <div className="text-sm text-muted-foreground p-4">
          No table renderer for "{table}"
        </div>
      )
  }
}

const LogQLQuery = () => {
  const [query, setQuery] = useState('');
  const { mutateAsync } = parseLogQlMut();

  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [schemaData, setSchemaData] = useState<any[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  // Predefined SQL queries adapted for Supabase
  const exampleQueries = [
    {
      query: `SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10;`,
      description: "View the latest 10 security alerts"
    },
    {
      query: `SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 10;`,
      description: "View all registered vehicles and their TEE status"
    },
    {
      query: `SELECT * FROM alerts WHERE severity = 'high' ORDER BY created_at DESC;`,
      description: "Find all critical security alerts"
    },
    {
      query: `SELECT tee_status, COUNT(*) as count FROM vehicles GROUP BY tee_status;`,
      description: "Count vehicles grouped by TEE status"
    },
    {
      query: `SELECT 'alerts' as table_name, COUNT(*) as row_count FROM alerts
UNION ALL
SELECT 'vehicles' as table_name, COUNT(*) as row_count FROM vehicles;`,
      description: "Check if tables have data"
    }
  ];

  const fetchSchemaInfo = async () => {
    setIsLoadingSchema(true);
    try {
      // Query to get all tables and their columns
      const schemaQuery = `
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default
        FROM 
          information_schema.tables t
        LEFT JOIN 
          information_schema.columns c ON t.table_name = c.table_name
        WHERE 
          t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name IN ('vehicles', 'alerts', 'threat_metrics')
        ORDER BY 
          t.table_name, c.ordinal_position;
      `;
      
      const { data, error } = await supabase.rpc('execute_sql', { query_text: schemaQuery });
      
      if (error) throw error;
      
      // Group columns by table
      const groupedSchema = data.reduce((acc: any, row: any) => {
        const tableName = row.table_name;
        if (!acc[tableName]) {
          acc[tableName] = {
            name: tableName,
            columns: []
          };
        }
        if (row.column_name) {
          acc[tableName].columns.push({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === 'YES',
            defaultValue: row.column_default
          });
        }
        return acc;
      }, {});
      
      setSchemaData(Object.values(groupedSchema));
    } catch (err) {
      console.error('Error fetching schema:', err);
      // Fallback to static schema if query fails
      setSchemaData(DATABASE_SCHEMA.map(item => ({
        name: item.table,
        description: item.description,
        columns: [] // Empty columns array for fallback
      })));
    } finally {
      setIsLoadingSchema(false);
    }
  };

  useEffect(() => {
    fetchSchemaInfo();
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // First, try to use the execute_sql function for raw SQL
      const { table, data } = await mutateAsync(query);
      
      const executionTime = Date.now() - startTime;
      const result: QueryResult = {
        id: Date.now().toString(),
        query,
        table: table as TableName,
        result: data || [],
        error: undefined,
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
        table: "vehicles",
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
              Advanced SQL Query
            </h1>
            <p className="text-muted-foreground">
              Write LogQL to query specific data with advanced database querying <br />
              [TABLE] [FIELD] [VALUE]
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {DATABASE_TYPE} {DATABASE_VERSION}
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Query Input Section */}
          <div className="xl:col-span-2 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
            {/* Query Editor */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Textarea
                    placeholder="e.g vehicles tee_status secure"
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
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Run
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Save className="h-3 w-3" />
                      Save
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
                    <ScrollArea className="max-h-[400px] w-full">
                      <div className="min-w-[900px]">
                        <ResultTable table={currentResult.table} rows={currentResult.result}/>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
            {/* Database Schema Info */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Schema
                  {isLoadingSchema && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-4">
                  {isLoadingSchema ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Loading schema...
                    </div>
                  ) : (
                    schemaData.map((table, index) => (
                      <div key={index} className="space-y-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span className="font-mono text-primary">{table.name}</span>
                          {table.description && (
                            <span className="text-xs text-muted-foreground">- {table.description}</span>
                          )}
                        </div>
                        {table.columns && table.columns.length > 0 ? (
                          <div className="ml-4 space-y-1">
                            {table.columns.map((column: any, colIndex: number) => (
                              <div key={colIndex} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-info">{column.name}</span>
                                  <span className="text-muted-foreground">({column.type})</span>
                                  {!column.nullable && (
                                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">NOT NULL</Badge>
                                  )}
                                </div>
                                {column.defaultValue && (
                                  <span className="text-xs text-muted-foreground">default: {column.defaultValue}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-4 text-xs text-muted-foreground">
                          </div>
                        )}
                        {index < schemaData.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchSchemaInfo}
                    disabled={isLoadingSchema}
                    className="w-full flex items-center gap-2"
                  >
                    {isLoadingSchema ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    ) : (
                      <Database className="h-3 w-3" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Example Queries */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Examples
                      </CardTitle>
                      {examplesOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CardDescription>
                    Try out common queries for analysis tasks
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    {exampleQueries.map((example, index) => (
                      <div key={index} className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-auto p-3"
                          onClick={() => loadExampleQuery(example.query)}
                        >
                          <div className="text-left">
                            <div className="text-xs text-muted-foreground">
                              {example.description}
                            </div>
                          </div>
                        </Button>
                        {index < exampleQueries.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Query History */}
            <Card className="bg-gradient-surface border-border shadow-soc">
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        History
                      </CardTitle>
                      {historyOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CardDescription>
                    Recent queries and their results
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <ScrollArea className="h-[300px] scrollbar-hide">
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
                </CollapsibleContent>
              </Collapsible>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
/* do it for the other schemas too. then change examples to logQL examples */
export default LogQLQuery;