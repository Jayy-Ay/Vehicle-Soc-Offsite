-- Create a function to execute raw SQL queries safely
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    result_json JSON;
    query_result RECORD;
    result_array JSON[] := '{}';
BEGIN
    -- Basic security: only allow SELECT statements
    IF NOT (TRIM(UPPER(query_text)) LIKE 'SELECT%') THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed';
    END IF;
    
    -- Execute the query and build JSON result
    FOR query_result IN EXECUTE query_text LOOP
        result_array := result_array || row_to_json(query_result);
    END LOOP;
    
    -- Convert array to JSON
    result_json := array_to_json(result_array);
    
    RETURN result_json;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Query execution error: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon, authenticated;