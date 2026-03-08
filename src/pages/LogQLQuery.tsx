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
import type { Database } from "@/lib/database.types";
import { VehiclesTable, AlertsTable, ThreatsTable } from "@/components/QueryTable";
import { useLogQLQuery } from "@/hooks/api/useVehicles";
import type { LogQLExecutionResult, QueryIntent } from "@/lib/LogQLParser";

// Database configuration
const DATABASE_TYPE = 'PostgreSQL';
const DATABASE_VERSION = '15+';

// Database schema configuration
const DATABASE_SCHEMA = [
  { table: 'vehicles', description: 'Vehicle data & TEE status' },
  { table: 'alerts', description: 'Security alerts' },
  { table: 'threat_metrics', description: 'Historical threat data' },
];

type TableName = "vehicles" | "alerts" | "threat_metrics";
type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];
type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
type ThreatRow = Database["public"]["Tables"]["threat_metrics"]["Row"];

interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
}

interface SchemaTable {
  name: string;
  description?: string;
  columns: SchemaColumn[];
}

type ExecutionRow = VehicleRow | AlertRow | ThreatRow;

type QueryResult = LogQLExecutionResult<ExecutionRow> & {
  id: string;
  inputText: string;
  error?: string;
  executedAt: Date;
  executionTime: number;
};

function ResultTable({ table, rows, }: { table: "vehicles" | "alerts" | "threat_metrics" ; rows: ExecutionRow[] }) {
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
  const { mutateAsync } = useLogQLQuery();

  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [schemaData, setSchemaData] = useState<SchemaTable[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  const exampleQueries = [
    {
      query: `alerts severity high last 2 hours limit 10`,
      description: "Latest high severity alerts in the last 2 hours"
    },
    {
      query: `vehicles tee_status critical in San Francisco`,
      description: "Critical vehicles in San Francisco"
    },
    {
      query: `alerts vehicle VH-1923 status investigating`,
      description: "Alerts under investigation for vehicle VH-1923"
    },
    {
      query: `threat metrics last 24 hours limit 50`,
      description: "Threat metrics over the last day"
    },
    {
      query: `vehicles model Model 3-2024 limit 5`,
      description: "Vehicles matching a specific model"
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
      type SchemaRow = {
        table_name: string;
        column_name: string | null;
        data_type: string | null;
        is_nullable: string | null;
        column_default: string | null;
      };

      const groupedSchema = (data as SchemaRow[]).reduce<Record<string, SchemaTable>>((acc, row) => {
        const tableName = row.table_name;
        if (!acc[tableName]) {
          acc[tableName] = {
            name: tableName,
            description: DATABASE_SCHEMA.find((item) => item.table === tableName)?.description,
            columns: []
          };
        }
        if (row.column_name) {
          acc[tableName].columns.push({
            name: row.column_name,
            type: row.data_type,
            nullable: row.is_nullable === 'YES',
            defaultValue: row.column_default ?? null
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
        columns: []
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
      const execution = await mutateAsync(query);
      
      const executionTime = Date.now() - startTime;
      const result: QueryResult = {
        ...execution,
        id: Date.now().toString(),
        inputText: query,
        error: undefined,
        executedAt: new Date(),
        executionTime,
        data: execution.data ?? [],
      };

      setCurrentResult(result);
      setQueryHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 queries
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const fallbackIntent: QueryIntent = {
        table: "vehicles",
        filters: [],
        limit: 0,
        orderBy: {
          field: "last_update",
          direction: "desc",
        },
      };
      const result: QueryResult = {
        id: Date.now().toString(),
        inputText: query,
        intent: fallbackIntent,
        logql: "",
        table: "vehicles",
        data: [],
        error: err instanceof Error ? err.message : 'Unknown error occurred while generating or executing LogQL.',
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
    setQuery(historyResult.inputText);
    setCurrentResult(historyResult);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              LogQL Query Explorer
            </h1>
            <p className="text-muted-foreground">
              Describe what you want in natural language. We will translate it into LogQL, execute it on Supabase, and show the results.
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
                    placeholder="e.g. show high severity alerts for vehicle VH-1923 in the last 2 hours"
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
                      <span>{currentResult.data.length} rows</span>
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
                    <>
                      <div className="mb-4">
                        <p className="text-xs uppercase text-muted-foreground mb-1">
                          Generated LogQL
                        </p>
                        <pre className="bg-muted/60 text-xs rounded-md p-3 overflow-x-auto border border-border">
                          {currentResult.logql}
                        </pre>
                      </div>
                      <ScrollArea className="max-h-[400px] w-full">
                        <div className="min-w-[900px]">
                          <ResultTable table={currentResult.table} rows={currentResult.data}/>
                        </div>
                      </ScrollArea>
                    </>
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
                            {table.columns.map((column: SchemaColumn, colIndex: number) => (
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
                                  {historyItem.inputText.split('\n')[0]}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {historyItem.error ? 'Error' : `${historyItem.data.length} rows`}
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
export default LogQLQuery;
