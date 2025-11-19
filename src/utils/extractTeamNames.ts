/**
 * Extract team names from a program title
 * Handles formats like "Team A vs Team B", "Team A - Team B", "Team A x Team B"
 * @param programName - The program/event name
 * @returns Array of team names or null if no teams found
 */
export const extractTeamNames = (programName: string): string[] | null => {
  if (!programName) return null;
  
  // Common separators for team names in sports events
  const separators = [' vs ', ' vs. ', ' x ', ' - ', ' v '];
  
  for (const separator of separators) {
    if (programName.toLowerCase().includes(separator.toLowerCase())) {
      const parts = programName.split(new RegExp(separator, 'i'));
      if (parts.length === 2) {
        return parts.map(team => team.trim());
      }
    }
  }
  
  return null;
};
