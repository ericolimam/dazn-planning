import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgramTable, Program } from "@/components/ProgramTable";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { ProgramFilters } from "@/components/ProgramFilters";
import { ProgramStatistics } from "@/components/ProgramStatistics";
import { toast } from "sonner";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";

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
  const [narrators, setNarrators] = useState<Array<{id: string; name: string}>>([]);
  const [stateEvents, setStateEvents] = useState<Array<{id: string; name: string}>>([]);
  const [cabines, setCabines] = useState<Array<{id: string; name: string}>>([]);
  const [commtypes, setCommtypes] = useState<Array<{id: string; name: string}>>([]);
  const [bts, setBts] = useState<Array<{id: string; name: string}>>([]);
  const [topcontents, setTopcontents] = useState<Array<{id: string; name: string}>>([]);
  const [currentFilters, setCurrentFilters] = useState<{ genre: string; year: string; serie: string; narrator: string }>({
    genre: '',
    year: '',
    serie: '',
    narrator: '',
  });

  // Load filter options on mount, but don't show programs in table
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setIsInitialLoading(true);
    try {
      console.log('Loading all programs for filtering...');
      
      // Load programs only with limit
      const programsResult = await supabase.functions.invoke('list-programs', {
        body: { genre: undefined, year: undefined, limit: 5000, offset: 0 },
      });

      if (programsResult.error) throw programsResult.error;

      if (programsResult.data?.success && programsResult.data?.data) {
        const programsData = programsResult.data.data as Program[];
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
        
        // Load narrators from API
        const narratorsResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'narrator' },
        });
        
        if (narratorsResult.data?.success && narratorsResult.data?.data) {
          setNarrators(narratorsResult.data.data);
          console.log(`Loaded ${narratorsResult.data.data.length} narrators from API`);
        }
        
        // Load cabines from API
        const cabinesResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'cabine' },
        });
        
        if (cabinesResult.data?.success && cabinesResult.data?.data) {
          setCabines(cabinesResult.data.data);
          console.log(`Loaded ${cabinesResult.data.data.length} cabines from API`);
        }
        
        // Load state events from API
        const stateEventsResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'state_event' },
        });
        
        if (stateEventsResult.data?.success && stateEventsResult.data?.data) {
          setStateEvents(stateEventsResult.data.data);
          console.log(`Loaded ${stateEventsResult.data.data.length} state events from API`);
        }
        
        // Load commtypes from API
        const commtypesResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'commtype' },
        });
        
        if (commtypesResult.data?.success && commtypesResult.data?.data) {
          setCommtypes(commtypesResult.data.data);
          console.log(`Loaded ${commtypesResult.data.data.length} commtypes from API`);
        }
        
        // Load BTs from API
        const btsResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'bt' },
        });
        
        if (btsResult.data?.success && btsResult.data?.data) {
          setBts(btsResult.data.data);
          console.log(`Loaded ${btsResult.data.data.length} BTs from API`);
        }
        
        // Load top contents from API
        const topcontentsResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'topcontent' },
        });
        
        if (topcontentsResult.data?.success && topcontentsResult.data?.data) {
          setTopcontents(topcontentsResult.data.data);
          console.log(`Loaded ${topcontentsResult.data.data.length} top contents from API`);
        }
        
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

  const fetchPrograms = async (filters: { genre: string; year: string; serie: string; narrator: string }) => {
    setIsLoading(true);
    setCurrentFilters(filters);
    
    try {
      console.log('Fetching programs with filters:', filters);
      
      // Send filters to backend - it will handle filtering before pagination
      const { data, error } = await supabase.functions.invoke('list-programs', {
        body: {
          genre: filters.genre || undefined,
          year: filters.year || undefined,
          serie: filters.serie || undefined,
          narrator: filters.narrator || undefined,
          limit: 5000,
          offset: 0,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const programsData = data.data as Program[];
        console.log(`Received ${programsData.length} programs from backend`);
        setPrograms(programsData);
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


  const handleRefreshAfterEdit = async () => {
    // Reload filter options and reapply current filters
    await loadFilterOptions();
    if (currentFilters.genre || currentFilters.year || currentFilters.serie || currentFilters.narrator) {
      await fetchPrograms(currentFilters);
    }
  };

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setPrograms([]);
    setCurrentFilters({ genre: "", year: "", serie: "", narrator: "" });
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
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-bold text-foreground">
              Catálogo de Programas
            </h1>
            <span className="text-2xl font-semibold text-primary">
              ({allPrograms.length.toLocaleString()})
            </span>
          </div>
          <p className="text-muted-foreground mt-2">
            Consulte e filtre o catálogo completo de programas
          </p>
        </div>
        
        <div className="space-y-6">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-lg font-semibold text-foreground">Carregando dados...</p>
              <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos</p>
            </div>
          ) : (
            <>
              {allPrograms.length > 0 && (
                <ProgramStatistics programs={allPrograms} />
              )}
              
              <ProgramFilters
                genres={genres}
                years={years}
                series={series}
                narrators={narrators}
                onFilter={fetchPrograms}
                onClear={handleClearFilters}
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
        onChange={handleRefreshAfterEdit}
        stateEvents={stateEvents}
        cabines={cabines}
        narrators={narrators}
        commtypes={commtypes}
        bts={bts}
        topcontents={topcontents}
      />
    </div>
  );
};

export default Index;
