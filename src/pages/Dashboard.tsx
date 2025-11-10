import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Program } from "@/components/ProgramTable";
import { Dashboard as DashboardComponent } from "@/components/Dashboard";
import { toast } from "sonner";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";

const Dashboard = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-programs', {
        body: { genre: undefined, year: undefined },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const programsData = data.data as Program[];
        setPrograms(programsData);
        console.log(`Loaded ${programsData.length} programs for dashboard`);
      }
    } catch (error: any) {
      console.error('Error loading programs:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
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
            Visão geral do catálogo de programas e estatísticas
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-lg font-semibold text-foreground">Carregando dados...</p>
            <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
          </div>
        ) : (
          <DashboardComponent programs={programs} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
