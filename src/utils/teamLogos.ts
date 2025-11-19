// Mapping of team names to UEFA Champions League logo IDs
const uefaLogoIds: Record<string, string> = {
  // Fase da Liga
  'ajax': '50143',
  'afc ajax': '50143',
  'arsenal': '52280',
  'arsenal fc': '52280',
  'atalanta': '52816',
  'atalanta bc': '52816',
  'athletic': '50125',
  'athletic club': '50125',
  'athletic bilbao': '50125',
  'atletico': '50124',
  'atleti': '50124',
  'atletico madrid': '50124',
  'atletico de madrid': '50124',
  'dortmund': '52758',
  'borussia dortmund': '52758',
  'bvb': '52758',
  'barcelona': '50080',
  'barça': '50080',
  'barca': '50080',
  'fc barcelona': '50080',
  'bayern': '50037',
  'bayern munich': '50037',
  'bayern munchen': '50037',
  'bayern münchen': '50037',
  'fc bayern': '50037',
  'benfica': '50147',
  'sl benfica': '50147',
  'bodo': '59333',
  'glimt': '59333',
  'bodo/glimt': '59333',
  'chelsea': '52914',
  'chelsea fc': '52914',
  'brugge': '50043',
  'club brugge': '50043',
  'copenhagen': '52709',
  'fc copenhagen': '52709',
  'frankfurt': '50072',
  'eintracht frankfurt': '50072',
  'galatasaray': '50067',
  'inter': '50138',
  'inter milan': '50138',
  'internazionale': '50138',
  'fc internazionale': '50138',
  'juventus': '50139',
  'juve': '50139',
  'leverkusen': '50109',
  'bayer leverkusen': '50109',
  'liverpool': '7889',
  'liverpool fc': '7889',
  'manchester city': '52919',
  'man city': '52919',
  'city': '52919',
  'marseille': '52748',
  'om': '52748',
  'olympique marseille': '52748',
  'monaco': '50023',
  'as monaco': '50023',
  'napoli': '50136',
  'ssc napoli': '50136',
  'newcastle': '59324',
  'newcastle united': '59324',
  'olympiacos': '2610',
  'pafos': '2609532',
  'pafos fc': '2609532',
  'paris': '52747',
  'psg': '52747',
  'paris saint-germain': '52747',
  'paris sg': '52747',
  'psv': '50062',
  'psv eindhoven': '50062',
  'qarabag': '60609',
  'real madrid': '50051',
  'madrid': '50051',
  'real': '50051',
  'slavia': '52498',
  'slavia praha': '52498',
  'slavia prague': '52498',
  'sporting': '50149',
  'sporting cp': '50149',
  'sporting lisbon': '50149',
  'tottenham': '1652',
  'spurs': '1652',
  'tottenham hotspur': '1652',
  'union': '64125',
  'union sg': '64125',
  'union saint-gilloise': '64125',
  'villarreal': '70691',
  'villarreal cf': '70691',
  // Play-off
  'basel': '59856',
  'fc basel': '59856',
  'celtic': '50050',
  'celtic fc': '50050',
  'crvena': '50069',
  'crvena zvezda': '50069',
  'red star': '50069',
  'estrela vermelha': '50069',
  'fenerbahce': '52692',
  'fenerbahçe': '52692',
  'ferencvaros': '52298',
  'ferencváros': '52298',
  'rangers': '50121',
  'rangers fc': '50121',
  'sturm': '50111',
  'sturm graz': '50111',
  // Outras
  'dynamo': '52723',
  'dynamo kyiv': '52723',
  'dynamo kiev': '52723',
  'feyenoord': '52749',
  'milan': '50058',
  'ac milan': '50058',
  'shakhtar': '52707',
  'shakhtar donetsk': '52707',
  'girona': '2603406',
  'girona fc': '2603406',
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

// Mapping of team names to La Liga club slugs
const laLigaClubSlugs: Record<string, string> = {
  'athletic': 'athletic-club',
  'athletic club': 'athletic-club',
  'athletic bilbao': 'athletic-club',
  'atletico': 'atletico-de-madrid',
  'atleti': 'atletico-de-madrid',
  'atletico madrid': 'atletico-de-madrid',
  'atletico de madrid': 'atletico-de-madrid',
  'osasuna': 'c-a-osasuna',
  'ca osasuna': 'c-a-osasuna',
  'celta': 'rc-celta',
  'celta vigo': 'rc-celta',
  'rc celta': 'rc-celta',
  'alaves': 'd-alaves',
  'alavés': 'd-alaves',
  'deportivo alaves': 'd-alaves',
  'deportivo alavés': 'd-alaves',
  'elche': 'elche-c-f',
  'elche cf': 'elche-c-f',
  'barcelona': 'fc-barcelona',
  'barça': 'fc-barcelona',
  'barca': 'fc-barcelona',
  'fc barcelona': 'fc-barcelona',
  'getafe': 'getafe-cf',
  'getafe cf': 'getafe-cf',
  'girona': 'girona-fc',
  'girona fc': 'girona-fc',
  'levante': 'levante-ud',
  'levante ud': 'levante-ud',
  'rayo': 'rayo-vallecano',
  'rayo vallecano': 'rayo-vallecano',
  'espanyol': 'rcd-espanyol',
  'rcd espanyol': 'rcd-espanyol',
  'mallorca': 'rcd-mallorca',
  'rcd mallorca': 'rcd-mallorca',
  'betis': 'real-betis',
  'real betis': 'real-betis',
  'real madrid': 'real-madrid',
  'madrid': 'real-madrid',
  'oviedo': 'real-oviedo',
  'real oviedo': 'real-oviedo',
  'sociedad': 'real-sociedad',
  'real sociedad': 'real-sociedad',
  'la real': 'real-sociedad',
  'valladolid': 'real-valladolid',
  'real valladolid': 'real-valladolid',
  'sevilla': 'sevilla-fc',
  'sevilla fc': 'sevilla-fc',
  'valencia': 'valencia-cf',
  'valencia cf': 'valencia-cf',
  'villarreal': 'villarreal-cf',
  'villarreal cf': 'villarreal-cf',
  'las palmas': 'ud-las-palmas',
  'ud las palmas': 'ud-las-palmas',
  'leganes': 'cd-leganes',
  'leganés': 'cd-leganes',
  'cd leganes': 'cd-leganes',
  'cd leganés': 'cd-leganes',
};

/**
 * Get the team logo URL based on the program name (supports UEFA, Bundesliga, and La Liga)
 * @param programName - The name of the program/event
 * @param size - Logo size (default: 24x24)
 * @returns The logo URL or null if no match found
 */
export const getTeamLogo = (programName: string, size: number = 24): string | null => {
  if (!programName) return null;
  
  const normalizedName = programName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents for better matching
  
  // Sort team names by length (longest first) to match more specific names first
  const sortByLength = (entries: [string, string][]) => 
    entries.sort((a, b) => b[0].length - a[0].length);
  
  // Try to find a matching team in La Liga first
  for (const [teamName, slug] of sortByLength(Object.entries(laLigaClubSlugs))) {
    const normalizedTeamName = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName.includes(normalizedTeamName)) {
      return `https://assets.laliga.com/squad-logos/club-${slug}.png`;
    }
  }
  
  // Try to find a matching team in Bundesliga
  for (const [teamName, logoId] of sortByLength(Object.entries(bundesligaLogoIds))) {
    const normalizedTeamName = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName.includes(normalizedTeamName)) {
      return `https://www.bundesliga.com/assets/clublogo/${logoId}.svg`;
    }
  }
  
  // Try to find a matching team in UEFA Champions League
  for (const [teamName, logoId] of sortByLength(Object.entries(uefaLogoIds))) {
    const normalizedTeamName = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedName.includes(normalizedTeamName)) {
      return `https://img.uefa.com/imgml/TP/teams/logos/${size}x${size}/${logoId}.png`;
    }
  }
  
  return null;
};
