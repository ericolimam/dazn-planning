import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Program } from "@/components/ProgramTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface DashboardProps {
  programs: Program[];
}

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#0ea5e9", "#059669", "#ec4899",
  "#6366f1", "#14b8a6", "#eab308", "#a855f7", "#22d3ee"
];

export const Dashboard = ({ programs }: DashboardProps) => {
  const currentYear = new Date().getFullYear();
  
  // Filter programs from current year
  const currentYearPrograms = programs.filter(program => {
    if (!program.X_TXDAY_DATE) return false;
    const programYear = new Date(program.X_TXDAY_DATE).getFullYear();
    return programYear === currentYear;
  });

  // Jogos por Serie e Narrador no ano corrente
  const narratorSeriesData = Object.entries(
    currentYearPrograms.reduce((acc, program) => {
      const narrator = program.NARRATOR || "Sem Narrador";
      const serie = program.SERIE_TITLE || "Sem Série";
      
      if (!acc[narrator]) {
        acc[narrator] = {};
      }
      acc[narrator][serie] = (acc[narrator][serie] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>)
  )
    .map(([narrator, series]) => ({
      narrator,
      ...series,
      total: Object.values(series).reduce((sum, count) => sum + count, 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Get all unique series for the chart
  const allSeries = Array.from(
    new Set(
      currentYearPrograms
        .map(p => p.SERIE_TITLE)
        .filter(Boolean)
    )
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-medium">{entry.value} jogos</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Header Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Programas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{programs.length.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {new Set(programs.map(p => p.PROG_TYPE).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Narradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Set(programs.map(p => p.NARRATOR).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Séries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {new Set(programs.map(p => p.SERIE_TITLE).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Jogos por Série e Narrador */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Jogos por Série - Narradores ({currentYear})</CardTitle>
          <p className="text-xs text-muted-foreground">Top 10 narradores e suas participações por série no ano corrente</p>
        </CardHeader>
        <CardContent className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={narratorSeriesData} 
              layout="vertical" 
              margin={{ left: 100, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis 
                dataKey="narrator" 
                type="category" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                width={95} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
              />
              {allSeries.slice(0, 15).map((serie, index) => (
                <Bar 
                  key={serie} 
                  dataKey={serie} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]}
                  name={serie}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
