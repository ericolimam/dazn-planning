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
    
    console.log('Checking credentials...');
    console.log('Username exists:', !!username);
    console.log('Username length:', username?.length || 0);
    console.log('Password exists:', !!password);
    console.log('Password length:', password?.length || 0);
    
    if (!username || !password) {
      throw new Error('API credentials not configured');
    }

    // Build the change request body - correct Provys format
    const attrs: any = {};

    // Map the updates to the correct attribute names
    // Only include fields with non-empty values to avoid permission errors
    if (updates.STATE_EVENT !== undefined && updates.STATE_EVENT !== '') {
      attrs["STATE_EVENT_RF"] = updates.STATE_EVENT;
    }

    if (updates.CABINE !== undefined && updates.CABINE !== '') {
      attrs["CABINE_RF"] = updates.CABINE;
    }

    if (updates.NARRATOR !== undefined && updates.NARRATOR !== '') {
      attrs["NARRATOR_RF"] = updates.NARRATOR;
    }

    // Boolean fields are always included since they're mandatory
    if (updates.RESUMO !== undefined) {
      attrs["RESUMO"] = updates.RESUMO;
    }

    if (updates.DESTAQUE_SEMANA !== undefined) {
      attrs["DESTAQUE"] = updates.DESTAQUE_SEMANA;
    }

    if (updates.PROMO_DAZN !== undefined) {
      attrs["PROMODAZN"] = updates.PROMO_DAZN;
    }
    
    console.log('Filtered attributes to update:', Object.keys(attrs));

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
    const response = await fetch('https://i00598.myprovys.com/api/objects/change', {
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
      
      // Parse error to provide more details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.ERROR_NM === 'KER_RIGHTS_INSUFFICIENTPRIVILEGES') {
          const displayName = errorData.PARAMS?.C_NLSDISPLAYNAME || 'campo desconhecido';
          console.error('⚠️ Permission denied for field:', displayName);
          const errorMsg = `Sem permissão para editar: ${displayName}`;
          throw new Error(errorMsg);
        }
        throw new Error(`API request failed: ${response.status} - ${errorData.ERRORMESSAGE || errorText}`);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message.includes('Sem permissão')) {
          throw parseError;
        }
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('=== PROVYS API SUCCESS ===');
    console.log('Update successful!');
    console.log('Response:', JSON.stringify(data, null, 2));

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
