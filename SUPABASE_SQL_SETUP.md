# Supabase SQL Function Setup Guide

## Step 1: Access Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor" in the left sidebar

## Step 2: Create the execute_sql Function
Copy and paste this SQL code into the SQL Editor and run it:

```sql
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
```

## Step 3: Test the Function
Run this test query to make sure it works:

```sql
SELECT execute_sql('SELECT * FROM alerts LIMIT 5');
```

## Step 4: Verify Your LogQL Query Interface
After creating the function, your LogQL Query interface should work properly with full SQL support.

## Security Notes
- The function only allows SELECT statements for security
- All queries are executed with security definer privileges
- Errors are caught and returned as exceptions

## Troubleshooting
- If you get permission errors, make sure the GRANT statement executed successfully
- If the function doesn't exist, double-check the CREATE FUNCTION statement ran without errors
- Check your Supabase project's SQL editor logs for any error messages