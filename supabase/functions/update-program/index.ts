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
    const { programId, updates } = await req.json();
    
    console.log('=== UPDATE PROGRAM REQUEST ===');
    console.log('Program ID:', programId);
    console.log('Updates:', updates);
    
    const username = Deno.env.get('PROVYS_API_USERNAME');
    const password = Deno.env.get('PROVYS_API_PASSWORD');
    
    if (!username || !password) {
      throw new Error('API credentials not configured');
    }

    // Build the change request body - correct Provys format
    const attrs: any = {};

    // Map the updates to the correct attribute names (remove PROG_ID. prefix)
    if (updates.STATE_EVENT !== undefined) {
      attrs["STATE_EVENT_RF"] = updates.STATE_EVENT;
    }

    if (updates.CABINE !== undefined) {
      attrs["CABINE_RF"] = updates.CABINE;
    }

    if (updates.NARRATOR !== undefined) {
      attrs["NARRATOR_RF"] = updates.NARRATOR;
    }

    if (updates.RESUMO !== undefined) {
      attrs["RESUMO"] = updates.RESUMO;
    }

    if (updates.DESTAQUE_SEMANA !== undefined) {
      attrs["DESTAQUE"] = updates.DESTAQUE_SEMANA;
    }

    if (updates.PROMO_DAZN !== undefined) {
      attrs["PROMODAZN"] = updates.PROMO_DAZN;
    }

    const requestBody: any = {
      ID: programId.toString(),
      ENTITY_NM: "PROG",
      ACTION_NM: "CHANGE",
      ATTRS: attrs
    };

    console.log('=== API REQUEST BODY ===');
    console.log(JSON.stringify(requestBody, null, 2));

    // Make API call
    const encodedCredentials = btoa(`${username}:${password}`);
    const response = await fetch('https://i00597.myprovys.com/api/objects/change', {
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
      console.error('PROVYS API error:', errorText);
      
      // Parse error to provide more details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.ERROR_NM === 'KER_RIGHTS_INSUFFICIENTPRIVILEGES') {
          const displayName = errorData.PARAMS?.C_NLSDISPLAYNAME || 'campo desconhecido';
          throw new Error(`Sem permissão para alterar: ${displayName}. Contate o administrador do sistema.`);
        }
        throw new Error(`API request failed: ${response.status} - ${errorData.ERRORMESSAGE || errorText}`);
      } catch (parseError) {
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('=== PROVYS API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-program function:', error);
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
