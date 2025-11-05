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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [genres, setGenres] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [series, setSeries] = useState<string[]>([]);

  // Load filter options on mount, but don't show programs in table
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setIsInitialLoading(true);
    try {
      console.log('Loading all programs for filtering...');
      const { data, error } = await supabase.functions.invoke('list-programs', {
        body: {
          genre: undefined,
          year: undefined,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const programsData = data.data as Program[];
        console.log(`Loaded ${programsData.length} programs into cache`);
        setAllPrograms(programsData);
        
        // Extract unique genres
        const uniqueGenres = [...new Set(programsData.map(p => p.GENRE).filter(Boolean))].sort();
        setGenres(uniqueGenres);
        
        // Extract unique years
        const uniqueYears = [...new Set(programsData.map(p => p.YEAR).filter(Boolean))].sort((a, b) => b - a);
        setYears(uniqueYears);
        
        // Extract unique series
        const uniqueSeries = [...new Set(programsData.map(p => p.SERIE_TITLE).filter(Boolean))].sort();
        setSeries(uniqueSeries);
        
        console.log(`Genres: ${uniqueGenres.length}, Years: ${uniqueYears.length}, Series: ${uniqueSeries.length}`);
        
        toast.success(`${programsData.length} programas carregados. Use os filtros para buscar.`);
      }
    } catch (error: any) {
      console.error('Error loading filter options:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchPrograms = async (filters: { genre: string; year: string; serie: string }) => {
    setIsLoading(true);
    
    try {
      // If we don't have all programs yet, fetch them
      if (allPrograms.length === 0) {
        const { data, error } = await supabase.functions.invoke('list-programs', {
          body: {
            genre: undefined,
            year: undefined,
          },
        });

        if (error) throw error;

        if (data?.success && data?.data) {
          const programsData = data.data as Program[];
          setAllPrograms(programsData);
          
          // Extract unique genres, years and series
          const uniqueGenres = [...new Set(programsData.map(p => p.GENRE).filter(Boolean))].sort();
          setGenres(uniqueGenres);
          
          const uniqueYears = [...new Set(programsData.map(p => p.YEAR).filter(Boolean))].sort((a, b) => b - a);
          setYears(uniqueYears);
          
          const uniqueSeries = [...new Set(programsData.map(p => p.SERIE_TITLE).filter(Boolean))].sort();
          setSeries(uniqueSeries);
          
          // Apply filters locally
          const filtered = filterProgramsLocally(programsData, filters);
          setPrograms(filtered);
          toast.success(`${filtered.length} programas encontrados`);
        } else {
          throw new Error('Resposta inválida da API');
        }
      } else {
        // We already have all programs, just filter locally
        const filtered = filterProgramsLocally(allPrograms, filters);
        setPrograms(filtered);
        toast.success(`${filtered.length} programas encontrados`);
      }
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      toast.error('Erro ao carregar programas: ' + (error.message || 'Erro desconhecido'));
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProgramsLocally = (data: Program[], filters: { genre: string; year: string; serie: string }): Program[] => {
    console.log('=== FILTERING LOCALLY ===');
    console.log('Total programs:', data.length);
    console.log('Filters:', filters);
    
    let filtered = [...data];
    
    if (filters.genre) {
      filtered = filtered.filter(p => p.GENRE === filters.genre);
      console.log(`After genre filter (${filters.genre}):`, filtered.length);
    }
    
    if (filters.year) {
      const yearNum = parseInt(filters.year);
      filtered = filtered.filter(p => p.YEAR === yearNum);
      console.log(`After year filter (${filters.year}):`, filtered.length);
    }
    
    if (filters.serie) {
      filtered = filtered.filter(p => p.SERIE_TITLE === filters.serie);
      console.log(`After serie filter (${filters.serie}):`, filtered.length);
    }
    
    // Log first 3 results for debugging
    if (filtered.length > 0) {
      console.log('First 3 results:', filtered.slice(0, 3).map(p => ({
        title: p.TITLE,
        genre: p.GENRE,
        year: p.YEAR,
        serie: p.SERIE_TITLE
      })));
    } else {
      console.log('No results found. Checking if data exists in original dataset...');
      if (filters.genre) {
        const genreMatches = data.filter(p => p.GENRE === filters.genre);
        console.log(`Programs with genre ${filters.genre}:`, genreMatches.length);
      }
      if (filters.year) {
        const yearNum = parseInt(filters.year);
        const yearMatches = data.filter(p => p.YEAR === yearNum);
        console.log(`Programs with year ${filters.year}:`, yearMatches.length);
      }
    }
    
    return filtered;
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
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-lg font-semibold text-foreground">Carregando dados...</p>
              <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
            </div>
          ) : (
            <>
              <ProgramFilters
                genres={genres}
                years={years}
                series={series}
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
                      {isLoading ? 'Filtrando...' : `${programs.length} programas encontrados`}
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
            </>
          )}
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
