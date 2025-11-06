import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Program } from "@/components/ProgramTable";
import { Film } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProgramStatisticsProps {
  programs: Program[];
}

// Color palettes for charts
const GENRE_COLORS = [
  "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#0ea5e9", "#059669", "#ec4899",
  "#6366f1", "#14b8a6", "#eab308"
];

const YEAR_COLORS = [
  "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe",
  "#1e3a8a", "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6",
  "#60a5fa", "#93c5fd", "#bfdbfe"
];

const TYPE_COLORS = [
  "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe",
  "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#ddd6fe", "#ede9fe", "#f5f3ff"
];

export const ProgramStatistics = ({ programs }: ProgramStatisticsProps) => {
  // Calculate statistics
  const totalPrograms = programs.length;
  
  // Programs by genre - TOP 5
  const genreCounts = programs.reduce((acc, program) => {
    const genre = program.GENRE || "Outros";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  const genreData = topGenres.map(([name, value]) => ({ name, value }));
  
  // Programs by year - TOP 5
  const yearCounts = programs.reduce((acc, program) => {
    const year = program.YEAR?.toString() || "Outros";
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topYears = Object.entries(yearCounts)
    .sort(([a], [b]) => {
      if (a === "Outros") return 1;
      if (b === "Outros") return -1;
      return parseInt(b) - parseInt(a);
    })
    .slice(0, 5);
  
  const yearData = topYears.map(([name, value]) => ({ name, value }));
  
  // Programs by type - TOP 5
  const typeCounts = programs.reduce((acc, program) => {
    const type = program.PROG_TYPE || "Outros";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  const typeData = topTypes.map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} programas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Genres Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 5 Gêneros</CardTitle>
          </CardHeader>
          <CardContent className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '8px', paddingLeft: '3px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Years Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 5 Anos</CardTitle>
          </CardHeader>
          <CardContent className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={yearData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {yearData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={YEAR_COLORS[index % YEAR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '8px', paddingLeft: '3px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Types Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-foreground/20 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 5 Tipos</CardTitle>
          </CardHeader>
          <CardContent className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '8px', paddingLeft: '3px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
