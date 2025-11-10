import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { programId } = await req.json();
    
    console.log('=== GET PROGRAM DETAILS REQUEST ===');
    console.log('Program ID:', programId);
    
    if (!programId) {
      throw new Error('Program ID is required');
    }
    
    const username = Deno.env.get('PROVYS_API_USERNAME');
    const password = Deno.env.get('PROVYS_API_PASSWORD');
    
    if (!username || !password) {
      throw new Error('API credentials not configured');
    }

    const requestBody = {
      ENTITY_NM: "PROG",
      ACTION_NM: "LIST",
      COLUMNS: [
        { ALIAS: "ID", ATTR_NM: "PROG_ID" },
        { ALIAS: "EPISODE", ATTR_NM: "EPISODENR" },
        { ALIAS: "X_TXDAY_DATE", ATTR_NM: "X_TXDAY_DATE" },
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
        { ALIAS: "STATE_EVENT_ID", ATTR_NM: "PROG_ID.STATE_EVENT_RF" },
        { ALIAS: "COMMTYPE", FORMAT: "NAME", ATTR_NM: "PROG_ID.COMMTYPE_RF" },
        { ALIAS: "COMMTYPE_ID", ATTR_NM: "PROG_ID.COMMTYPE_RF" },
        { ALIAS: "BT", FORMAT: "NAME", ATTR_NM: "PROG_ID.BT_RF" },
        { ALIAS: "BT_ID", ATTR_NM: "PROG_ID.BT_RF" },
        { ALIAS: "PRODADDINFO", ATTR_NM: "PRODADDINFO" },
        { ALIAS: "MATCHHIGH", ATTR_NM: "MATCHHIGH" },
        { ALIAS: "TOPCONTENT_RF", FORMAT: "NAME", ATTR_NM: "PROG_ID.TOPCONTENT_RF" },
        { ALIAS: "TOPCONTENT_RF_ID", ATTR_NM: "PROG_ID.TOPCONTENT_RF" },
        { ALIAS: "CLASSICDERBI", ATTR_NM: "CLASSICDERBI" },
        { ALIAS: "CONTENTDETAIL", ATTR_NM: "CONTENTDETAIL" },
        { ALIAS: "PLATAFORMBANNERS", ATTR_NM: "PLATAFORMBANNERS" },
        { ALIAS: "PROMOINDIVIDUAL", ATTR_NM: "PROMOINDIVIDUAL" },
        { ALIAS: "PROMOCONJUNTA", ATTR_NM: "PROMOCONJUNTA" },
        { ALIAS: "PROMOGENERICA", ATTR_NM: "PROMOGENERICA" },
        { ALIAS: "PROMO10S", ATTR_NM: "PROMO10S" },
        { ALIAS: "DETALHESPROMO", ATTR_NM: "DETALHESPROMO" },
        { ALIAS: "TELCOS", ATTR_NM: "TELCOS" },
        { ALIAS: "CRM", ATTR_NM: "CRM" },
        { ALIAS: "SOCIAL", ATTR_NM: "SOCIAL" }
      ],
      CONDITIONS: [
        {
          ATTR_NM: "PROG_ID",
          OPERATOR: "EQ",
          VALUE: programId
        }
      ]
    };

    console.log('Fetching program details from API...');
    
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
      console.error('API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received program details');
    console.log('COMMTYPE_ID:', data.ROWS?.[0]?.COMMTYPE_ID);
    console.log('COMMTYPE:', data.ROWS?.[0]?.COMMTYPE);
    console.log('BT_ID:', data.ROWS?.[0]?.BT_ID);
    console.log('BT:', data.ROWS?.[0]?.BT);

    if (!data.ROWS || data.ROWS.length === 0) {
      throw new Error('Program not found');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data.ROWS[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-program-details function:', error);
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
