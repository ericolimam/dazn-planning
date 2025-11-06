import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { week, channel } = await req.json();
    
    const apiUsername = Deno.env.get('PROVYS_API_USERNAME');
    const apiPassword = Deno.env.get('PROVYS_API_PASSWORD');

    if (!apiUsername || !apiPassword) {
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

    const requestBody = {
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

    const credentials = btoa(`${apiUsername}:${apiPassword}`);
    
    const response = await fetch('https://i00597.myprovys.com/api/objects/list', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Provys API error:', response.status, response.statusText);
      throw new Error(`Provys API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Provys API response received, rows:', data?.ROWS?.length || 0);

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in list-schedule function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
