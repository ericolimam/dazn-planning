import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Program } from "@/components/ProgramTable";
import { BarChart3, Film, Calendar, TrendingUp } from "lucide-react";

interface ProgramStatisticsProps {
  programs: Program[];
}

export const ProgramStatistics = ({ programs }: ProgramStatisticsProps) => {
  // Calculate statistics
  const totalPrograms = programs.length;
  
  // Programs by genre
  const genreCounts = programs.reduce((acc, program) => {
    const genre = program.GENRE || "Sem gênero";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  // Programs by year
  const yearCounts = programs.reduce((acc, program) => {
    const year = program.YEAR || "Sem ano";
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<string | number, number>);
  
  const recentYears = Object.entries(yearCounts)
    .sort(([a], [b]) => {
      const yearA = typeof a === 'string' ? parseInt(a) : a;
      const yearB = typeof b === 'string' ? parseInt(b) : b;
      return yearB - yearA;
    })
    .slice(0, 5);
  
  // Programs by type (using PROG_TYPE)
  const typeCounts = programs.reduce((acc, program) => {
    const type = program.PROG_TYPE || "Sem tipo";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Programs */}
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Programas</CardTitle>
          <Film className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalPrograms}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Carregados no sistema
          </p>
        </CardContent>
      </Card>

      {/* Top Genres */}
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Por Gênero</CardTitle>
          <BarChart3 className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topGenres.slice(0, 3).map(([genre, count]) => (
              <div key={genre} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[120px]">{genre}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
          {topGenres.length > 3 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{topGenres.length - 3} outros gêneros
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Years */}
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Por Ano</CardTitle>
          <Calendar className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentYears.slice(0, 3).map(([year, count]) => (
              <div key={year} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{year}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
          {recentYears.length > 3 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{recentYears.length - 3} outros anos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Program Types */}
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Por Tipo</CardTitle>
          <TrendingUp className="h-4 w-4 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topTypes.slice(0, 3).map(([type, count]) => (
              <div key={type} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[120px]">{type}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
          {topTypes.length > 3 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{topTypes.length - 3} outros tipos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
