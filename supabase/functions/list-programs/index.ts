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
    const { genre, year } = await req.json();
    
    console.log('=== FILTER REQUEST ===');
    console.log('Genre:', genre);
    console.log('Year:', year);
    
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

    // Build request body
    const requestBody: any = {
      ENTITY_NM: "PROG",
      ACTION_NM: "LIST",
      COLUMNS: [
        { ALIAS: "ID", ATTR_NM: "PROG_ID" },
        { ALIAS: "EPISODE", ATTR_NM: "EPISODENR" },
        { ALIAS: "TITLE", ATTR_NM: "TITLE" },
        { ALIAS: "SERIE_TITLE", ATTR_NM: "PROG_ID.SERIES_ID.TITLE" },
        { ALIAS: "GENRE", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.GENRE_RF" },
        { ALIAS: "PROG_TYPE", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.PROGTYPE_RF" },
        { ALIAS: "REQ_TYPE", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.REQTYPE_RF" },
        { ALIAS: "PROG_CATEGORY", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.PROGCATEGORY_RF" },
        { ALIAS: "ACQ_TYPE", FORMAT: "NAME", ATTR_NM: "PROG_ID.SERIES_ID.ACQTYPE_RF" },
        { ALIAS: "CABINE", FORMAT: "NAME", ATTR_NM: "PROG_ID.CABINE_RF" },
        { ALIAS: "CABINE_ID", ATTR_NM: "PROG_ID.CABINE_RF" },
        { ALIAS: "NARRATOR", FORMAT: "NAME", ATTR_NM: "PROG_ID.NARRATOR_RF" },
        { ALIAS: "NARRATOR_ID", ATTR_NM: "PROG_ID.NARRATOR_RF" },
        { ALIAS: "COMMENTATOR", ATTR_NM: "PROG_ID.COMMENTATOR" },
        { ALIAS: "TIME_BEFORE", DOMAIN_NM: "TIME", FORMAT: "HHMM", ATTR_NM: "PROG_ID.SATELITESTART" },
        { ALIAS: "TIME_ENDING", DOMAIN_NM: "TIME", FORMAT: "HHMM", ATTR_NM: "PROG_ID.SATELITEEND" },
        { ALIAS: "RESUMO", ATTR_NM: "RESUMO" },
        { ALIAS: "DESTAQUE_SEMANA", ATTR_NM: "DESTAQUE" },
        { ALIAS: "PROMO_DAZN", ATTR_NM: "PROMODAZN" },
        { ALIAS: "YEAR", FORMAT: "YYYY", ATTR_NM: "PROG_ID.SERIES_ID.CREATION_DATE" },
        { ALIAS: "STATE_EVENT", FORMAT: "NAME", ATTR_NM: "PROG_ID.STATE_EVENT_RF" },
        { ALIAS: "STATE_EVENT_ID", ATTR_NM: "PROG_ID.STATE_EVENT_RF" }
      ]
    };

    // Add filters if provided
    const conditions: any[] = [];
    
    if (genre) {
      conditions.push({
        ATTR_NM: "PROG_ID.SERIES_ID.GENRE_RF",
        OPERATOR: "EQ",
        VALUE: genre
      });
    }
    
    if (year) {
      conditions.push({
        ATTR_NM: "PROG_ID.SERIES_ID.CREATION_DATE",
        OPERATOR: "EQ",
        FORMAT: "YYYY",
        VALUE: year.toString()
      });
    }

    if (conditions.length > 0) {
      requestBody.CONDITIONS = conditions;
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
    
    // Log first 3 programs to verify filtering
    if (data.ROWS && data.ROWS.length > 0) {
      console.log('First 3 programs:');
      data.ROWS.slice(0, 3).forEach((row: any, idx: number) => {
        console.log(`  ${idx + 1}. ${row.TITLE} - Genre: ${row.GENRE}, Year: ${row.YEAR}`);
      });
    }

    // Return the rows
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data.ROWS || [] 
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