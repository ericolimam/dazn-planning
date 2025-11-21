import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ScheduleEvent {
  NARRATOR?: string;
  SERIES: string;
  YEAR?: number;
}

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#0ea5e9", "#059669", "#ec4899",
  "#6366f1", "#14b8a6", "#eab308", "#a855f7", "#22d3ee"
];

const Dashboard = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-schedule', {
        body: {},
      });

      if (error) throw error;

      if (data?.ROWS) {
        setScheduleData(data.ROWS as ScheduleEvent[]);
        console.log(`Loaded ${data.ROWS.length} schedule events for dashboard`);
      }
    } catch (error: any) {
      console.error('Error loading schedule:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  
  // Filter events from current year with narrator
  const currentYearEvents = scheduleData.filter(event => {
    if (!event.YEAR || !event.NARRATOR) return false;
    const eventYear = parseInt(event.YEAR.toString());
    return eventYear === currentYear;
  });

  // Build data: narrator -> series -> count
  const narratorSeriesData = Object.entries(
    currentYearEvents.reduce((acc, event) => {
      const narrator = event.NARRATOR || "Sem Narrador";
      const series = event.SERIES || "Sem Série";
      
      if (!acc[narrator]) {
        acc[narrator] = {};
      }
      acc[narrator][series] = (acc[narrator][series] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>)
  )
    .map(([narrator, series]) => ({
      narrator,
      ...series,
      total: Object.values(series).reduce((sum, count) => sum + count, 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15); // Top 15 narrators

  // Get all unique series for the chart
  const allSeries = Array.from(
    new Set(
      currentYearEvents
        .map(e => e.SERIES)
        .filter(Boolean)
    )
  ).slice(0, 10); // Limit to top 10 series for readability

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <img src={daznLogo} alt="DAZN" className="h-10 w-10 dark:invert" />
              <nav className="flex gap-6">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/">Programas</NavLink>
                <NavLink to="/schedule">Grade de Programação</NavLink>
                <NavLink to="/timeline">Timeline</NavLink>
              </nav>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Participação de narradores por série no ano {currentYear}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-lg font-semibold text-foreground">Carregando dados...</p>
            <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
          </div>
        ) : narratorSeriesData.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                Nenhum dado disponível para {currentYear}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Verifique se existem jogos com narradores associados na grade de programação
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Jogos por Série - Narradores ({currentYear})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Top 15 narradores e suas participações por série no ano corrente
              </p>
            </CardHeader>
            <CardContent className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={narratorSeriesData}
                  margin={{ left: 20, right: 20, top: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="narrator" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    label={{ value: 'Número de Jogos', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                    iconType="circle"
                  />
                  {allSeries.map((series, index) => (
                    <Bar 
                      key={series} 
                      dataKey={series} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]}
                      name={series}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
