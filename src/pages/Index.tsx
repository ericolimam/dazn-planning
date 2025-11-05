import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgramTable, Program } from "@/components/ProgramTable";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { ProgramFilters } from "@/components/ProgramFilters";
import { toast } from "sonner";

const Index = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Removed auto-fetch on mount - user must click "Buscar" to load data

  const fetchPrograms = async (filters: { genre: string; year: string }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-programs', {
        body: {
          genre: filters.genre || undefined,
          year: filters.year ? parseInt(filters.year) : undefined,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const programsData = data.data as Program[];
        setPrograms(programsData);
        
        // Store all programs for extracting unique filters
        if (!filters.genre && !filters.year) {
          setAllPrograms(programsData);
          
          // Extract unique genres
          const uniqueGenres = [...new Set(programsData.map(p => p.GENRE).filter(Boolean))].sort();
          setGenres(uniqueGenres);
          
          // Extract unique years
          const uniqueYears = [...new Set(programsData.map(p => p.YEAR).filter(Boolean))].sort((a, b) => b - a);
          setYears(uniqueYears);
        }
        
        toast.success(`${programsData.length} programas encontrados`);
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error('Erro ao carregar programas: ' + (error.message || 'Erro desconhecido'));
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gerenciador de Programas
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de consulta PROG</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <ProgramFilters
            genres={genres}
            years={years}
            onFilter={fetchPrograms}
            isLoading={isLoading}
          />

          <div>
            {programs.length === 0 && !isLoading ? (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground text-center">
                  Selecione os filtros e clique em "Buscar" para carregar os programas
                </p>
              </div>
            ) : (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Carregando...' : `${programs.length} programas encontrados`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Clique duas vezes em uma linha para ver detalhes
                </p>
              </div>
            )}
            
            <ProgramTable
              programs={programs}
              onProgramClick={handleProgramClick}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <ProgramDetailModal
        program={selectedProgram}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Index;
