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
    const { referenceType } = await req.json();
    console.log('=== REFERENCE REQUEST ===');
    console.log('Reference type:', referenceType);

    const apiUsername = Deno.env.get('PROVYS_API_USERNAME');
    const apiPassword = Deno.env.get('PROVYS_API_PASSWORD');

    if (!apiUsername || !apiPassword) {
      throw new Error('API credentials not configured');
    }

    // Map reference types to their entity names
    const entityMap: Record<string, string> = {
      'narrator': 'NARRATOR',
      'cabine': 'CABINE',
      'state_event': 'STATE_EVENT',
    };

    const entityName = entityMap[referenceType];
    if (!entityName) {
      throw new Error(`Unknown reference type: ${referenceType}`);
    }

    const requestBody = {
      ENTITY_NM: entityName,
      ACTION_NM: 'LIST',
      COLUMNS: [
        {
          ALIAS: 'ID',
          ATTR_NM: `${entityName}_ID`,
        },
        {
          ALIAS: 'NAME',
          ATTR_NM: 'NAME',
        },
      ],
    };

    console.log('API REQUEST BODY:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://i00598.myprovys.com/api/objects/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PROVYS API error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Total ${referenceType} records received:`, data.ROWS?.length || 0);

    // Transform the response
    const items = data.ROWS?.map((row: any) => ({
      id: String(row.ID),
      name: row.NAME,
    })) || [];

    console.log(`First 3 ${referenceType}:`, items.slice(0, 3));

    return new Response(
      JSON.stringify({ success: true, data: items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
