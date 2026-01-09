const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== LIST-SCHEDULE-WEEKS REQUEST ===');
    
    const apiUsername = Deno.env.get('PROVYS_API_USERNAME');
    const apiPassword = Deno.env.get('PROVYS_API_PASSWORD');

    if (!apiUsername || !apiPassword) {
      console.error('API credentials not configured');
      throw new Error('API credentials not configured');
    }

    // Fetch only weeks and channels data - much lighter query
    const provysRequestBody = {
      "ENTITY_NM": "TXWEEK",
      "ACTION_NM": "LIST",
      "COLUMNS": [
        { "ALIAS": "WEEK", "ATTR_NM": "WEEK" },
        { "ALIAS": "CHANNEL", "FORMAT": "NAME", "ATTR_NM": "CHANNEL_RF" }
      ]
    };

    console.log('Calling Provys API for weeks data...');
    const credentials = btoa(`${apiUsername}:${apiPassword}`);
    
    const response = await fetch('https://i00597.myprovys.com/api/objects/list', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(provysRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Provys API error:', response.status, response.statusText, errorText);
      throw new Error(`Provys API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Total weeks received:', data?.ROWS?.length || 0);
    
    // Extract unique weeks and channels
    const rows = data?.ROWS || [];
    const weeks = [...new Set(rows.map((r: any) => r.WEEK).filter(Boolean))].sort((a: any, b: any) => a - b);
    const channels = [...new Set(rows.map((r: any) => r.CHANNEL).filter(Boolean))].sort();
    
    // Generate years based on current year (we can't get it from TXWEEK)
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    return new Response(JSON.stringify({ weeks, channels, years }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in list-schedule-weeks function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
