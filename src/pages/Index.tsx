import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgramTable, Program } from "@/components/ProgramTable";
import { ProgramDetailModal } from "@/components/ProgramDetailModal";
import { ProgramFilters } from "@/components/ProgramFilters";
import { toast } from "sonner";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";
import jsPDF from "jspdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [genres, setGenres] = useState<Array<{id: string; name: string}>>([]);
  const [years, setYears] = useState<number[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [narrators, setNarrators] = useState<Array<{id: string; name: string}>>([]);
  const [stateEvents, setStateEvents] = useState<Array<{id: string; name: string}>>([]);
  const [cabines, setCabines] = useState<Array<{id: string; name: string}>>([]);
  const [commtypes, setCommtypes] = useState<Array<{id: string; name: string}>>([]);
  const [bts, setBts] = useState<Array<{id: string; name: string}>>([]);
  const [topcontents, setTopcontents] = useState<Array<{id: string; name: string}>>([]);
  const [currentFilters, setCurrentFilters] = useState<{ genre: string; year: string; serie: string; narrator: string; dateFrom: string; dateTo: string }>({
    genre: '',
    year: '',
    serie: '',
    narrator: '',
    dateFrom: '',
    dateTo: '',
  });
  const [viewMode, setViewMode] = useState<'TODOS' | 'PLANNING' | 'PROMOTION'>('TODOS');

  // Load filter options on mount, but don't show programs in table
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setIsInitialLoading(true);
    try {
      console.log('Loading ALL programs for filtering options...');
      
      // Load ALL programs without limit to get all series
      const programsResult = await supabase.functions.invoke('list-programs', {
        body: { limit: 100000, offset: 0 },
      });

      if (programsResult.error) throw programsResult.error;

      if (programsResult.data?.success && programsResult.data?.data) {
        const programsData = programsResult.data.data as Program[];
        console.log(`Loaded ${programsData.length} total programs`);
        setAllPrograms(programsData);
        
        // Load genres from API
        const genresResult = await supabase.functions.invoke('list-references', {
          body: { referenceType: 'genre' },
        });
        
        if (genresResult.data?.success && genresResult.data?.data) {
          setGenres(genresResult.data.data);
          console.log(`Loaded ${genresResult.data.data.length} genres from API`);
        }
        
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
        
        console.log(`Genres: ${genres.length}, Years: ${uniqueYears.length}, Series: ${uniqueSeries.length}`);
        
        toast.success(`${programsData.length} programas carregados. Use os filtros para buscar.`);
      }
    } catch (error: any) {
      console.error('Error loading filter options:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchPrograms = async (filters: { genre: string; year: string; serie: string; narrator: string; dateFrom: string; dateTo: string }) => {
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
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
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
    if (currentFilters.genre || currentFilters.year || currentFilters.serie || currentFilters.narrator || currentFilters.dateFrom || currentFilters.dateTo) {
      await fetchPrograms(currentFilters);
    }
  };

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleProgramSave = (updatedProgram: Program) => {
    // Update the program in the local list to reflect changes immediately
    setPrograms(prevPrograms => 
      prevPrograms.map(p => p.ID === updatedProgram.ID ? updatedProgram : p)
    );
  };

  const handleClearFilters = () => {
    setPrograms([]);
    setCurrentFilters({ genre: "", year: "", serie: "", narrator: "", dateFrom: "", dateTo: "" });
  };

  const exportToPDF = async () => {
    if (programs.length === 0) {
      toast.error("Nenhum programa para exportar");
      return;
    }

    try {
      // Convert logo to base64
      const logoBase64 = await fetch(daznLogo)
        .then(res => res.blob())
        .then(blob => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }));

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      programs.forEach((program, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Header with logo
        doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Ficha Cadastral de Programa', 105, 20, { align: 'center' });
        
        let yPos = 40;
        const leftCol = 14;
        const rightCol = 110;
        const lineHeight = 7;

        // Helper function to add field
        const addField = (label: string, value: any, col: number = leftCol) => {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`${label}:`, col, yPos);
          doc.setFont('helvetica', 'normal');
          const text = value !== null && value !== undefined ? String(value) : '-';
          doc.text(text, col, yPos + 4);
          return lineHeight;
        };

        // Seção Produção
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(71, 85, 105);
        doc.rect(leftCol, yPos, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('PRODUÇÃO', leftCol + 2, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        // Left column
        yPos += addField('ID', program.ID, leftCol);
        yPos += addField('Episódio', program.EPISODE, leftCol);
        yPos += addField('Data TX', program.X_TXDAY_DATE, leftCol);
        yPos += addField('Título', program.TITLE, leftCol);
        yPos = 52 + (lineHeight * 4);
        
        yPos += addField('Série', program.SERIE_TITLE, rightCol);
        yPos += addField('Gênero', program.GENRE, rightCol);
        yPos += addField('Tipo Programa', program.PROG_TYPE, rightCol);
        yPos += addField('Tipo Requisição', program.REQ_TYPE, rightCol);

        yPos = Math.max(yPos, 52 + (lineHeight * 8)) + 3;
        yPos += addField('Categoria', program.PROG_CATEGORY, leftCol);
        yPos += addField('Tipo Aquisição', program.ACQ_TYPE, leftCol);
        yPos += addField('Cabine', program.CABINE, leftCol);
        yPos += addField('Narrador', program.NARRATOR, leftCol);
        
        yPos = 52 + (lineHeight * 8) + 3;
        yPos += addField('Comentador', program.COMMENTATOR, rightCol);
        yPos += addField('Time Before', program.TIME_BEFORE, rightCol);
        yPos += addField('Time Ending', program.TIME_ENDING, rightCol);
        yPos += addField('Ano', program.YEAR, rightCol);

        yPos = Math.max(yPos, 52 + (lineHeight * 16)) + 5;

        // Seção Planning
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(71, 85, 105);
        doc.rect(leftCol, yPos, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('PLANNING', leftCol + 2, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        yPos += addField('State Event', program.STATE_EVENT, leftCol);
        yPos += addField('Comm Type', program.COMMTYPE, leftCol);
        yPos += addField('BT', program.BT, leftCol);
        
        yPos = 52 + (lineHeight * 16) + 5 + 12;
        yPos += addField('Prod. Add Info', program.PRODADDINFO, rightCol);
        yPos += addField('Match High', program.MATCHHIGH, rightCol);

        yPos = Math.max(yPos, 52 + (lineHeight * 21)) + 5;

        // Seção Promoção
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(71, 85, 105);
        doc.rect(leftCol, yPos, 182, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('PROMOÇÃO', leftCol + 2, yPos + 5);
        doc.setTextColor(0, 0, 0);
        yPos += 12;

        yPos += addField('Resumo', program.RESUMO ? 'Sim' : 'Não', leftCol);
        yPos += addField('Destaque Semana', program.DESTAQUE_SEMANA ? 'Sim' : 'Não', leftCol);
        yPos += addField('Promo DAZN', program.PROMO_DAZN ? 'Sim' : 'Não', leftCol);
        yPos += addField('Top Content', program.TOPCONTENT_RF, leftCol);
        yPos += addField('Classic Derbi', program.CLASSICDERBI ? 'Sim' : 'Não', leftCol);
        yPos += addField('Content Detail', program.CONTENTDETAIL, leftCol);
        yPos += addField('Platform Banners', program.PLATAFORMBANNERS ? 'Sim' : 'Não', leftCol);
        
        yPos = 52 + (lineHeight * 21) + 5 + 12;
        yPos += addField('Promo Individual', program.PROMOINDIVIDUAL ? 'Sim' : 'Não', rightCol);
        yPos += addField('Promo Conjunta', program.PROMOCONJUNTA ? 'Sim' : 'Não', rightCol);
        yPos += addField('Promo Genérica', program.PROMOGENERICA ? 'Sim' : 'Não', rightCol);
        yPos += addField('Promo 10s', program.PROMO10S ? 'Sim' : 'Não', rightCol);
        yPos += addField('Detalhes Promo', program.DETALHESPROMO, rightCol);
        yPos += addField('Telcos', program.TELCOS ? 'Sim' : 'Não', rightCol);
        yPos += addField('CRM', program.CRM ? 'Sim' : 'Não', rightCol);
        yPos += addField('Social', program.SOCIAL ? 'Sim' : 'Não', rightCol);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${index + 1} de ${programs.length}`, 105, 285, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 290, { align: 'center' });
      });

      doc.save(`fichas_programas_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
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
              <ProgramFilters
                genres={genres}
                years={years}
                series={series}
                narrators={narrators}
                onFilter={fetchPrograms}
                onClear={handleClearFilters}
                isLoading={isLoading}
                onExportPDF={exportToPDF}
                hasPrograms={programs.length > 0}
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
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? 'Filtrando...' : `${programs.length} programas encontrados`}
                      </p>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="view-mode" className="text-xs text-muted-foreground">Visualização:</Label>
                        <Select value={viewMode} onValueChange={(value: 'TODOS' | 'PLANNING' | 'PROMOTION') => setViewMode(value)}>
                          <SelectTrigger id="view-mode" className="h-8 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODOS">Todos</SelectItem>
                            <SelectItem value="PLANNING">Planning</SelectItem>
                            <SelectItem value="PROMOTION">Promotion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Clique duas vezes em uma linha para ver detalhes
                    </p>
                  </div>
                )}
                
                <ProgramTable
                  programs={programs}
                  onProgramClick={handleProgramClick}
                  isLoading={isLoading}
                  onProgramUpdate={handleProgramSave}
                  stateEvents={stateEvents}
                  cabines={cabines}
                  narrators={narrators}
                  commtypes={commtypes}
                  bts={bts}
                  topcontents={topcontents}
                  viewMode={viewMode}
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
        onSave={handleProgramSave}
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
