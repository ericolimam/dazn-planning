import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, year, serie, narrator, limit = 5000, offset = 0 } = await req.json();
    
    console.log('=== FILTER REQUEST ===');
    console.log('Genre:', genre);
    console.log('Year:', year);
    console.log('Serie:', serie);
    console.log('Narrator:', narrator);
    console.log('Limit:', limit);
    console.log('Offset:', offset);
    
    const username = Deno.env.get('PROVYS_API_USERNAME');
    const password = Deno.env.get('PROVYS_API_PASSWORD');
    
    console.log('Checking credentials...');
    console.log('Username exists:', !!username);
    console.log('Username length:', username?.length || 0);
    console.log('Password exists:', !!password);
    console.log('Password length:', password?.length || 0);
    
    if (!username || !password) {
      throw new Error('API credentials not configured');
    }

    // Build request body - Request only essential columns for listing
    const requestBody: any = {
      ENTITY_NM: "PROG",
      ACTION_NM: "LIST",
      COLUMNS: [
        { ALIAS: "ID", ATTR_NM: "PROG_ID" },
        { ALIAS: "EPISODE", ATTR_NM: "EPISODENR" },
        { ALIAS: "X_TXDAY_DATE", ATTR_NM: "X_TXDAY_DATE" },
        { ALIAS: "TITLE", ATTR_NM: "TITLE" },
        { ALIAS: "SERIE_TITLE", ATTR_NM: "PROG_ID.SERIES_ID.TITLE" },
        { ALIAS: "GENRE", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.GENRE_RF" },
        { ALIAS: "YEAR", FORMAT: "YYYY", ATTR_NM: "PROG_ID.SERIES_ID.CREATION_DATE" },
        { ALIAS: "NARRATOR", FORMAT: "NAME", ATTR_NM: "PROG_ID.NARRATOR_RF" },
        { ALIAS: "STATE_EVENT", FORMAT: "NAME", ATTR_NM: "PROG_ID.STATE_EVENT_RF" }
      ]
    };

    // Add filters if provided
    const filters: any[] = [];
    
    if (genre) {
      filters.push({
        ATTR_NM: "PROG_ID.SERIES_ID.GENRE_RF",
        OPERATOR: "=",
        VALUE: genre
      });
    }
    
    if (year) {
      filters.push({
        ATTR_NM: "PROG_ID.SERIES_ID.CREATION_DATE",
        OPERATOR: "=",
        FORMAT: "YYYY",
        VALUE: `${year}-01-01T00:00:00.000Z`
      });
    }

    if (serie) {
      filters.push({
        ATTR_NM: "PROG_ID.SERIES_ID.TITLE",
        OPERATOR: "=",
        VALUE: serie
      });
    }

    if (narrator) {
      filters.push({
        ATTR_NM: "PROG_ID.NARRATOR_RF",
        OPERATOR: "=",
        FORMAT: "NAME",
        VALUE: narrator
      });
    }

    if (filters.length > 0) {
      requestBody.FILTERS = filters;
    }

    console.log('=== API REQUEST BODY ===');
    console.log(JSON.stringify(requestBody, null, 2));

    // Make API call
    const encodedCredentials = btoa(`${username}:${password}`);
    const response = await fetch('https://i00598.myprovys.com/api/objects/list', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== API ERROR RESPONSE ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Headers:', Object.fromEntries(response.headers.entries()));
      console.error('Body:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('=== PROVYS API RESPONSE ===');
    console.log('Total rows received:', data.ROWS?.length || 0);
    
    // Apply pagination
    const allRows = data.ROWS || [];
    const paginatedRows = allRows.slice(offset, offset + limit);
    
    console.log(`Returning ${paginatedRows.length} rows (offset: ${offset}, limit: ${limit})`);
    
    // Log first 3 programs to verify filtering
    if (paginatedRows.length > 0) {
      console.log('First 3 programs:');
      paginatedRows.slice(0, 3).forEach((row: any, idx: number) => {
        console.log(`  ${idx + 1}. ${row.TITLE} - Genre: ${row.GENRE}, Year: ${row.YEAR}`);
      });
    }

    // Return the paginated rows
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: paginatedRows,
        total: allRows.length,
        offset,
        limit
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in list-programs function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});