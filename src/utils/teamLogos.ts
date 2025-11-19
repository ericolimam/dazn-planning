// Mapping of team names to UEFA Champions League logo IDs
const uefaLogoIds: Record<string, string> = {
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

// Mapping of team names to Bundesliga logo IDs
const bundesligaLogoIds: Record<string, string> = {
  'bayern': 'DFL-CLU-00000G',
  'bayern münchen': 'DFL-CLU-00000G',
  'bayern munchen': 'DFL-CLU-00000G',
  'leverkusen': 'DFL-CLU-00000B',
  'bayer leverkusen': 'DFL-CLU-00000B',
  'frankfurt': 'DFL-CLU-00000F',
  'eintracht frankfurt': 'DFL-CLU-00000F',
  'dortmund': 'DFL-CLU-000007',
  'borussia dortmund': 'DFL-CLU-000007',
  'freiburg': 'DFL-CLU-00000A',
  'sc freiburg': 'DFL-CLU-00000A',
  'mainz': 'DFL-CLU-000006',
  'mainz 05': 'DFL-CLU-000006',
  'leipzig': 'DFL-CLU-000017',
  'rb leipzig': 'DFL-CLU-000017',
  'bremen': 'DFL-CLU-00000E',
  'werder bremen': 'DFL-CLU-00000E',
  'werder': 'DFL-CLU-00000E',
  'stuttgart': 'DFL-CLU-00000D',
  'vfb stuttgart': 'DFL-CLU-00000D',
  'gladbach': 'DFL-CLU-000004',
  'mönchengladbach': 'DFL-CLU-000004',
  'monchengladbach': 'DFL-CLU-000004',
  'borussia': 'DFL-CLU-000004',
  'wolfsburg': 'DFL-CLU-000003',
  'vfl wolfsburg': 'DFL-CLU-000003',
  'augsburg': 'DFL-CLU-000010',
  'fc augsburg': 'DFL-CLU-000010',
  'union berlin': 'DFL-CLU-00000V',
  'union': 'DFL-CLU-00000V',
  'st. pauli': 'DFL-CLU-00000H',
  'st pauli': 'DFL-CLU-00000H',
  'pauli': 'DFL-CLU-00000H',
  'hoffenheim': 'DFL-CLU-000002',
  'tsg hoffenheim': 'DFL-CLU-000002',
  'heidenheim': 'DFL-CLU-000018',
  'fc heidenheim': 'DFL-CLU-000018',
  'köln': 'DFL-CLU-000008',
  'koln': 'DFL-CLU-000008',
  'fc köln': 'DFL-CLU-000008',
  'fc koln': 'DFL-CLU-000008',
  'hamburg': 'DFL-CLU-00000C',
  'hamburger sv': 'DFL-CLU-00000C',
  'hsv': 'DFL-CLU-00000C',
};

/**
 * Get the team logo URL based on the program name (supports UEFA and Bundesliga)
 * @param programName - The name of the program/event
 * @param size - Logo size (default: 24x24)
 * @returns The logo URL or null if no match found
 */
export const getTeamLogo = (programName: string, size: number = 24): string | null => {
  if (!programName) return null;
  
  const normalizedName = programName.toLowerCase();
  
  // Try to find a matching team in Bundesliga first (more specific matches)
  for (const [teamName, logoId] of Object.entries(bundesligaLogoIds)) {
    if (normalizedName.includes(teamName)) {
      return `https://www.bundesliga.com/assets/clublogo/${logoId}.svg`;
    }
  }
  
  // Try to find a matching team in UEFA Champions League
  for (const [teamName, logoId] of Object.entries(uefaLogoIds)) {
    if (normalizedName.includes(teamName)) {
      return `https://img.uefa.com/imgml/TP/teams/logos/${size}x${size}/${logoId}.png`;
    }
  }
  
  return null;
};
