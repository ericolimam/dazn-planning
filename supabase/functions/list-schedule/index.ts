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
    console.log('=== LIST-SCHEDULE REQUEST ===');
    
    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch (e) {
      console.log('No body provided, using empty filters');
    }
    
    const { week, channel } = requestBody;
    console.log('Filters requested:', { week, channel });
    
    const apiUsername = Deno.env.get('PROVYS_API_USERNAME');
    const apiPassword = Deno.env.get('PROVYS_API_PASSWORD');

    if (!apiUsername || !apiPassword) {
      console.error('API credentials not configured');
      throw new Error('API credentials not configured');
    }

    const filters = [
      { "OPERATOR": "=", "VALUE": "N", "ATTR_NM": "ENVELOPE" },
      { "OPERATOR": "NL", "VALUE": null, "ATTR_NM": "TECHSLOT" },
      { "OPERATOR": ">", "VALUE": "01.01.2015", "ATTR_NM": "TXSCHED_ID.TXDAY_DATE" },
      { "OPERATOR": "<", "VALUE": "01.01.2040", "ATTR_NM": "TXSCHED_ID.TXDAY_DATE" }
    ];

    // Add optional filters
    if (week) {
      filters.push({ "OPERATOR": "=", "VALUE": week.toString(), "ATTR_NM": "TXSCHED_ID.TXWEEK_ID.WEEK" });
    }
    if (channel) {
      filters.push({ "OPERATOR": "=", "VALUE": channel, "ATTR_NM": "TXSCHED_ID.TXWEEK_ID.CHANNEL_RF" });
    }

    const provysRequestBody = {
      "ENTITY_NM": "TXSLOT",
      "ACTION_NM": "LIST",
      "COLUMNS": [
        { "ALIAS": "ID", "ATTR_NM": "TXSLOT_ID" },
        { "ALIAS": "SERIES", "ATTR_NM": "TXREQ_ID.PROG_ID.SERIES_ID.TITLE" },
        { "ALIAS": "PROGRAMME", "ATTR_NM": "TXREQ_ID.PROG_ID.TITLE" },
        { "ALIAS": "PROG_REQTYPE", "FORMAT": "NAME", "ATTR_NM": "TXREQ_ID.PROG_ID.REQTYPE_RF" },
        { "ALIAS": "WEEK", "ATTR_NM": "TXSCHED_ID.TXWEEK_ID.WEEK" },
        { "ALIAS": "DATE", "FORMAT": "MM/DD/YYYY", "ATTR_NM": "TXSCHED_ID.TXDAY_DATE" },
        { "ALIAS": "START_TIME", "FORMAT": "HHMMSS", "ATTR_NM": "START_TC" },
        { "ALIAS": "BILLED_START", "FORMAT": "HHMMSS", "ATTR_NM": "BILLEDSTART_TC" },
        { "ALIAS": "DURATION", "FORMAT": "HHMM", "ATTR_NM": "DURATION_TC" },
        { "ALIAS": "CHANNEL", "FORMAT": "NAME", "ATTR_NM": "TXSCHED_ID.TXWEEK_ID.CHANNEL_RF" },
        { "ALIAS": "TXSLOT_NAME", "ATTR_NM": "NAME" },
        { "ALIAS": "SERIES_REQTYPE", "FORMAT": "NAME", "ATTR_NM": "TXREQ_ID.PROG_ID.SERIES_ID.REQTYPE_RF" },
        { "ALIAS": "GENRE", "FORMAT": "NAME", "ATTR_NM": "TXREQ_ID.PROG_ID.SERIES_ID.GENRE_RF" },
        { "ALIAS": "PROGCATEGORY", "FORMAT": "NAME", "ATTR_NM": "TXREQ_ID.PROG_ID.SERIES_ID.PROGCATEGORY_RF" }
      ],
      "FILTERS": filters
    };

    console.log('Calling Provys API for schedule data...');
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
    console.log('=== PROVYS SCHEDULE RESPONSE ===');
    console.log('Total rows received:', data?.ROWS?.length || 0);
    
    if (data?.ROWS && data.ROWS.length > 0) {
      console.log('First 3 events:');
      data.ROWS.slice(0, 3).forEach((row: any, i: number) => {
        console.log(`  ${i + 1}. ${row.PROGRAMME || row.SERIES} - Channel: ${row.CHANNEL}, Week: ${row.WEEK}, Date: ${row.DATE}`);
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in list-schedule function:', error);
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
