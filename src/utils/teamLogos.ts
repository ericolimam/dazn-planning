// Mapping of team names to UEFA Champions League logo IDs
const teamLogoIds: Record<string, string> = {
  // Fase da Liga
  'ajax': '50143',
  'arsenal': '52280',
  'atalanta': '52816',
  'athletic': '50125',
  'atletico': '50124',
  'atleti': '50124',
  'dortmund': '52758',
  'barcelona': '50080',
  'barça': '50080',
  'bayern': '50037',
  'benfica': '50147',
  'bodo': '59333',
  'glimt': '59333',
  'chelsea': '52914',
  'brugge': '50043',
  'copenhagen': '52709',
  'frankfurt': '50072',
  'galatasaray': '50067',
  'inter': '50138',
  'internazionale': '50138',
  'juventus': '50139',
  'juve': '50139',
  'leverkusen': '50109',
  'liverpool': '7889',
  'manchester city': '52919',
  'man city': '52919',
  'city': '52919',
  'marseille': '52748',
  'monaco': '50023',
  'napoli': '50136',
  'newcastle': '59324',
  'olympiacos': '2610',
  'pafos': '2609532',
  'paris': '52747',
  'psg': '52747',
  'psv': '50062',
  'qarabag': '60609',
  'real madrid': '50051',
  'madrid': '50051',
  'slavia': '52498',
  'sporting': '50149',
  'tottenham': '1652',
  'spurs': '1652',
  'union': '64125',
  'villarreal': '70691',
  // Play-off
  'basel': '59856',
  'celtic': '50050',
  'crvena': '50069',
  'estrela vermelha': '50069',
  'fenerbahce': '52692',
  'ferencvaros': '52298',
  'rangers': '50121',
  'sturm': '50111',
  // Outras
  'dynamo': '52723',
  'feyenoord': '52749',
  'milan': '50058',
  'ac milan': '50058',
  'shakhtar': '52707',
  'girona': '2603406',
};

/**
 * Get the UEFA Champions League team logo URL based on the program name
 * @param programName - The name of the program/event
 * @param size - Logo size (default: 24x24)
 * @returns The logo URL or null if no match found
 */
export const getTeamLogo = (programName: string, size: number = 24): string | null => {
  if (!programName) return null;
  
  const normalizedName = programName.toLowerCase();
  
  // Try to find a matching team in the program name
  for (const [teamName, logoId] of Object.entries(teamLogoIds)) {
    if (normalizedName.includes(teamName)) {
      return `https://img.uefa.com/imgml/TP/teams/logos/${size}x${size}/${logoId}.png`;
    }
  }
  
  return null;
};
