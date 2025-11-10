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
  // 1. Quantidade total de programas x Broadcast Type (PROG_TYPE)
  const programsByType = Object.entries(
    programs.reduce((acc, program) => {
      const type = program.PROG_TYPE || "Sem Tipo";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // 2. Quantidade total de programas x Narradores
  const programsByNarrator = Object.entries(
    programs.reduce((acc, program) => {
      const narrator = program.NARRATOR || "Sem Narrador";
      acc[narrator] = (acc[narrator] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // 3. Séries x Broadcast Type (PROG_TYPE)
  const seriesByType = Object.entries(
    programs.reduce((acc, program) => {
      const type = program.PROG_TYPE || "Sem Tipo";
      const serie = program.SERIE_TITLE || "Sem Série";
      const key = `${serie}`;
      if (!acc[key]) {
        acc[key] = { serie, types: {} };
      }
      acc[key].types[type] = (acc[key].types[type] || 0) + 1;
      return acc;
    }, {} as Record<string, { serie: string; types: Record<string, number> }>)
  )
    .map(([_, data]) => ({
      name: data.serie,
      value: Object.values(data.types).reduce((sum, v) => sum + v, 0)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // 4. Séries x Narradores
  const seriesByNarrator = Object.entries(
    programs.reduce((acc, program) => {
      const narrator = program.NARRATOR || "Sem Narrador";
      const serie = program.SERIE_TITLE || "Sem Série";
      const key = `${serie}`;
      if (!acc[key]) {
        acc[key] = { serie, narrators: {} };
      }
      acc[key].narrators[narrator] = (acc[key].narrators[narrator] || 0) + 1;
      return acc;
    }, {} as Record<string, { serie: string; narrators: Record<string, number> }>)
  )
    .map(([_, data]) => ({
      name: data.serie,
      value: Object.values(data.narrators).reduce((sum, v) => sum + v, 0)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.name}</p>
          <p className="text-sm text-primary font-medium">
            {payload[0].value} programas
          </p>
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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Programas x Broadcast Type */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Programas por Tipo</CardTitle>
            <p className="text-xs text-muted-foreground">Top 10 tipos com mais programas</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programsByType} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={75} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {programsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Programas x Narradores */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Programas por Narrador</CardTitle>
            <p className="text-xs text-muted-foreground">Top 10 narradores com mais programas</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programsByNarrator} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={75} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {programsByNarrator.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Séries x Broadcast Type */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Séries por Tipo</CardTitle>
            <p className="text-xs text-muted-foreground">Top 10 séries com mais episódios</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seriesByType} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {seriesByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Séries x Narradores */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Séries por Narrador</CardTitle>
            <p className="text-xs text-muted-foreground">Top 10 séries distribuídas por narradores</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seriesByNarrator} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} width={115} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {seriesByNarrator.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
