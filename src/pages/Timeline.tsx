import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/ScheduleFilters";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { Loader2, FileDown } from "lucide-react";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { ScheduleEvent } from "./Schedule";
import { Star, Sparkles, TrendingUp } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Função para gerar cor consistente baseada no nome do gênero
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Paleta de cores bem distintas
  const colors = [
    '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
    '#e11d48', '#06b6d4', '#fb923c', '#0284c7', '#16a34a',
    '#6366f1', '#14b8a6', '#ec4899', '#facc15', '#64748b',
    '#f43f5e', '#84cc16', '#22c55e', '#f97316', '#a855f7',
    '#0ea5e9', '#eab308', '#d946ef', '#fb7185', '#4ade80',
    '#fbbf24', '#c084fc', '#38bdf8', '#a3e635', '#34d399',
    '#fcd34d', '#818cf8', '#f472b6', '#fdba74', '#2dd4bf',
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getGenreColor = (genre: string) => {
  if (!genre) return '#6b7280';
  
  // Cores fixas e únicas para cada gênero principal
  const fixedColors: Record<string, string> = {
    'FUTEBOL': '#10b981',
    'BASQUETEBOL': '#f59e0b',
    'ATLETISMO': '#3b82f6',
    'BOXE': '#ef4444',
    'PROGRAMAS': '#8b5cf6',
    'MMA': '#e11d48',
    'TÉNIS': '#06b6d4',
    'TENNIS': '#06b6d4', // Mesmo que TÉNIS
    'DARDOS': '#fb923c',
    'HÓQUEI': '#0284c7',
    'RÂGUEBI': '#16a34a',
    'ANDEBOL': '#6366f1',
    'TÉNIS DE MESA': '#14b8a6',
    'VOLEIBOL': '#ec4899',
    'CICLISMO': '#facc15',
    'AUTOMOBILISMO': '#64748b',
    'FUTEBOL AMERICANO': '#f43f5e',
    'GOLFE': '#84cc16',
    'NATAÇÃO': '#22c55e',
    'GINÁSTICA': '#a855f7',
    'SURF': '#0ea5e9',
    'ESGRIMA': '#eab308',
    'JUDO': '#d946ef',
    'KARATE': '#fb7185',
    'TAEKWONDO': '#4ade80',
    'WRESTLE': '#fbbf24',
    'LUTAS': '#c084fc',
    'MOTOCICLISMO': '#38bdf8',
    'RALLY': '#a3e635',
    'F1': '#34d399',
    'CRÍQUETE': '#fcd34d',
    'BASEBALL': '#818cf8',
    'SOFTBALL': '#f472b6',
    'HÓQUEI NO GELO': '#fdba74',
    'PATINAGEM': '#2dd4bf',
  };
  
  // Se tem cor fixa, usa ela
  if (fixedColors[genre]) {
    return fixedColors[genre];
  }
  
  // Para gêneros desconhecidos, gera cor baseada no hash do nome
  // Isso garante que o mesmo gênero sempre terá a mesma cor
  return stringToColor(genre);
};

const getEventColor = (event: ScheduleEvent) => {
  if (event.TXSLOT_NAME === 'SEM EMISSÃO') {
    return '#000000';
  }
  return getGenreColor(event.GENRE);
};

const getPremiereIcon = (premiere: string) => {
  if (!premiere) return null;
  
  const icons: Record<string, JSX.Element> = {
    'ESTREIA': <Star className="h-3 w-3 inline-block mr-1" fill="gold" color="gold" />,
    'EXCLUSIVO': <Sparkles className="h-3 w-3 inline-block mr-1" fill="white" color="white" />,
    'DESTAQUE': <TrendingUp className="h-3 w-3 inline-block mr-1" color="yellow" />,
  };
  
  return icons[premiere] || null;
};

const parseDateTime = (dateStr: string, timeStr: string) => {
  const [month, day, year] = dateStr.split('/');
  const [hours, minutes, seconds] = timeStr.split(':').map(s => parseInt(s));
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes, seconds || 0);
};

const parseDuration = (duration: string) => {
  const parts = duration.split(':').map(s => parseFloat(s));
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
};

const extractYearFromDate = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  return parseInt(parts[2]);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Get current week number
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

export default function Timeline() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(getCurrentWeek());
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["DAZN 1"]);
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allScheduleData } = useQuery({
    queryKey: ["schedule-all"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-schedule", {
        body: {},
      });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const weeks = allScheduleData?.ROWS 
    ? [...new Set<number>(allScheduleData.ROWS.map((r: ScheduleEvent) => r.WEEK).filter((w: number) => w))].sort((a: number, b: number) => a - b)
    : [];
  
  const channels = allScheduleData?.ROWS 
    ? [...new Set<string>(allScheduleData.ROWS.map((r: ScheduleEvent) => r.CHANNEL).filter((c: string) => c))].sort()
    : [];

  const years = allScheduleData?.ROWS 
    ? [...new Set<number>(allScheduleData.ROWS.map((r: ScheduleEvent) => extractYearFromDate(r.DATE)).filter((y): y is number => y !== null))].sort((a: number, b: number) => b - a)
    : [];

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["schedule-filtered", selectedWeek, selectedChannels, selectedYear],
    queryFn: async () => {
      if (!allScheduleData?.ROWS) return { ROWS: [] };
      
      let filtered = [...allScheduleData.ROWS];
      
      if (selectedWeek !== null) {
        filtered = filtered.filter((r: ScheduleEvent) => r.WEEK === selectedWeek);
      }
      
      if (selectedChannels.length > 0) {
        filtered = filtered.filter((r: ScheduleEvent) => selectedChannels.includes(r.CHANNEL));
      }
      
      if (selectedYear !== null) {
        filtered = filtered.filter((r: ScheduleEvent) => {
          const year = extractYearFromDate(r.DATE);
          return year !== null && year === selectedYear;
        });
      }
      
      return { ROWS: filtered };
    },
    enabled: !!allScheduleData,
  });

  const timelineData = useMemo(() => {
    if (!scheduleData?.ROWS) return { days: [], minTime: 5, maxTime: 29 };

    const events = scheduleData.ROWS
      .filter((event: ScheduleEvent) => event.PROG_REQTYPE === 'PROGRAMA' || event.TXSLOT_NAME === 'SEM EMISSÃO')
      .map((event: ScheduleEvent) => {
        try {
          const start = parseDateTime(event.DATE, event.START_TIME);
          const duration = parseDuration(event.DURATION);
          const end = new Date(start.getTime() + duration);
          
          // Calculate hours in 24h+ format for events after midnight
          let startHour = start.getHours() + start.getMinutes() / 60;
          let endHour = end.getHours() + end.getMinutes() / 60;
          
          // If event starts before 5am, treat it as next day (24+ hours)
          if (startHour < 5) startHour += 24;
          if (endHour < 5) endHour += 24;
          // If event ends before it starts, it crossed midnight
          if (endHour < startHour) endHour += 24;
          
          return {
            ...event,
            startDate: start,
            endDate: end,
            startHour,
            endHour,
          };
        } catch (error) {
          return null;
        }
      })
      .filter(e => e !== null);

    // If week is selected, show all days of that week
    let filteredEvents = events;
    if (selectedWeek) {
      filteredEvents = events.filter(e => e.WEEK === selectedWeek);
    } else {
      // Filter by selected date only if no week is selected
      filteredEvents = events.filter(e => {
        const eventDate = e.startDate.toISOString().split('T')[0];
        return eventDate === selectedDate;
      });
    }

    // Group by date and channel
    const dateGroups = new Map<string, typeof filteredEvents>();
    filteredEvents.forEach(event => {
      const dateKey = event.startDate.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(event);
    });

    // Sort dates
    const sortedDates = Array.from(dateGroups.keys()).sort();

    // Create structure: days -> channels -> events
    const days = sortedDates.map(date => {
      const dayEvents = dateGroups.get(date)!;
      const channelGroups = channels.map(channel => ({
        channel,
        events: dayEvents.filter(e => e.CHANNEL === channel).sort((a, b) => a.startHour - b.startHour),
      })).filter(g => g.events.length > 0);

      return {
        date,
        dateFormatted: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        channels: channelGroups,
      };
    });

    // Fixed time range: 5am to 5am next day (5 to 29 in 24h+ format)
    const minTime = 5;
    const maxTime = 29;

    return { days, minTime, maxTime };
  }, [scheduleData, channels, selectedDate, selectedWeek]);

  const hourRange = timelineData.maxTime - timelineData.minTime;
  const hourWidth = 120; // pixels per hour

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Convert DAZN logo to base64 and add to PDF
    const img = new Image();
    img.src = daznLogo;
    
    // Helper function to draw header on each page
    const drawHeader = (pageYPosition: number, showFilters: boolean = true) => {
      // Add logo
      doc.addImage(img, 'PNG', 14, 6, 12, 12);
      
      // Title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Timeline de Programação', 30, 12);

      // Filters info
      if (showFilters) {
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        let filterText = 'Filtros: ';
        if (selectedWeek) {
          filterText += `Semana ${selectedWeek}`;
        } else {
          filterText += `Data ${new Date(selectedDate).toLocaleDateString('pt-BR')}`;
        }
        if (selectedYear) {
          filterText += `, Ano ${selectedYear}`;
        }
        if (selectedChannels.length > 0) {
          filterText += `, Canais: ${selectedChannels.join(', ')}`;
        }
        doc.text(filterText, 30, 16);
      }
      
      return pageYPosition;
    };

    // Helper to convert genre color hex to RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [107, 114, 128];
    };

    // Helper to draw a timeline visualization
    const drawTimeline = (
      events: any[],
      x: number,
      y: number,
      width: number,
      height: number,
      showLabels: boolean = true
    ) => {
      // Timeline background
      doc.setFillColor(240, 240, 240);
      doc.rect(x, y, width, height, 'F');

      // Draw time markers
      if (showLabels) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
      }
      const totalHours = hourRange;
      const pixelsPerHour = width / totalHours;

      for (let i = 0; i <= totalHours; i += 2) {
        const hour = timelineData.minTime + i;
        const displayHour = hour >= 24 ? hour - 24 : hour;
        const tickX = x + (i * pixelsPerHour);
        
        // Draw tick mark
        doc.setDrawColor(180, 180, 180);
        doc.line(tickX, y, tickX, y + height);
        
        // Draw hour label
        if (showLabels) {
          doc.text(`${displayHour.toString().padStart(2, '0')}:00`, tickX, y - 0.5);
        }
      }

      // Draw events as colored blocks
      events.forEach((event) => {
        const startOffset = (event.startHour - timelineData.minTime) / totalHours;
        const duration = (event.endHour - event.startHour) / totalHours;
        
        const blockX = x + (startOffset * width);
        const blockWidth = duration * width;
        
        // Get color for event
        const color = getEventColor(event);
        const [r, g, b] = hexToRgb(color);
        
        // Draw event block
        doc.setFillColor(r, g, b);
        doc.rect(blockX, y + 2, blockWidth, height - 4, 'F');
        
        // Add white border
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.2);
        doc.rect(blockX, y + 2, blockWidth, height - 4, 'S');
      });
    };

    // PAGE 1: Overview with all timelines
    let yPosition = drawHeader(24, true);

    // Title for overview
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Group all events by day and channel for overview
    const overviewData: { date: string; dateFormatted: string; channels: any[] }[] = [];
    timelineData.days.forEach(day => {
      const dayData = {
        date: day.date,
        dateFormatted: day.dateFormatted,
        channels: day.channels
      };
      overviewData.push(dayData);
    });

    // Draw overview timelines
    overviewData.forEach((day) => {
      // Day header
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(day.dateFormatted, 14, yPosition);
      yPosition += 5;

      // Draw each channel timeline
      day.channels.forEach((channelGroup) => {
        // Check if we need a new page
        if (yPosition > 180) {
          doc.addPage();
          yPosition = drawHeader(24, false);
        }

        // Channel name
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(channelGroup.channel, 14, yPosition + 3);

        // Draw timeline
        const timelineHeight = 8;
        const timelineWidth = 250;
        const timelineX = 45;
        
        drawTimeline(channelGroup.events, timelineX, yPosition, timelineWidth, timelineHeight, false);
        
        yPosition += timelineHeight + 3;
      });

      yPosition += 3; // Extra space between days
    });

    // DETAILED PAGES: One page per channel with timeline and table
    timelineData.days.forEach((day) => {
      day.channels.forEach((channelGroup) => {
        doc.addPage();

        let detailYPosition = drawHeader(24, true);

        // Day and Channel header
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${day.dateFormatted} - ${channelGroup.channel}`, 14, detailYPosition);
        detailYPosition += 6;

        // Draw timeline visualization
        const timelineHeight = 12;
        const timelineWidth = 260;
        const timelineX = 14;
        
        drawTimeline(channelGroup.events, timelineX, detailYPosition, timelineWidth, timelineHeight, true);

        detailYPosition += timelineHeight + 5;

        // Events table
        doc.setTextColor(0, 0, 0);
        const tableData = channelGroup.events.map(event => {
          return [
            formatTime(event.startDate) + ' - ' + formatTime(event.endDate),
            event.PROGRAMME || event.SERIES || event.TXSLOT_NAME || 'Sem programação',
            event.GENRE || '-',
            event.PREMIERE || '-'
          ];
        });

        autoTable(doc, {
          startY: detailYPosition,
          head: [['Horário', 'Programa', 'Gênero', 'Premiere']],
          body: tableData,
          theme: 'striped',
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [41, 128, 185], fontSize: 8, fontStyle: 'bold', cellPadding: 2 },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          didParseCell: (data) => {
            // Color code genre column
            if (data.column.index === 2 && data.section === 'body') {
              const rowIndex = data.row.index;
              const event = channelGroup.events[rowIndex];
              const color = getEventColor(event);
              const [r, g, b] = hexToRgb(color);
              data.cell.styles.fillColor = [r, g, b];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });
      });
    });

    // Save PDF
    const fileName = selectedWeek 
      ? `timeline_semana_${selectedWeek}_${selectedYear || ''}.pdf`
      : `timeline_${selectedDate}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Timeline de Programação
          </h1>
          <p className="text-muted-foreground">
            Visualização em linha do tempo da programação por canal
          </p>
        </div>

        {!selectedWeek && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
        )}

        <div className="space-y-4">
          <ScheduleFilters
            selectedWeek={selectedWeek}
            selectedChannels={selectedChannels}
            selectedYear={selectedYear}
            onWeekChange={setSelectedWeek}
            onChannelsChange={setSelectedChannels}
            onYearChange={setSelectedYear}
            weeks={weeks}
            channels={channels}
            years={years}
          />
          
          {timelineData.days.length > 0 && (
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-foreground">Legenda:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-xs text-muted-foreground">Futebol</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="text-xs text-muted-foreground">Basquetebol</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-xs text-muted-foreground">Atletismo</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-xs text-muted-foreground">Boxe</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <span className="text-xs text-muted-foreground">Programas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#000000' }}></div>
                  <span className="text-xs text-muted-foreground">Sem Emissão</span>
                </div>
              </div>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>

        <Card className="p-6 bg-card border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : timelineData.days.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum evento encontrado {selectedWeek ? 'para a semana selecionada' : 'para a data selecionada'}
            </div>
          ) : (
            <div className="space-y-8">
              {timelineData.days.map(({ date, dateFormatted, channels: dayChannels }) => (
                <div key={date}>
                  {selectedWeek && (
                    <h2 className="text-xl font-bold mb-4 text-foreground">
                      {dateFormatted}
                    </h2>
                  )}
                  
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: `${hourRange * hourWidth + 200}px` }}>
                      {/* Time header */}
                      <div className="flex items-center mb-4 border-b border-border pb-2">
                        <div className="w-32 flex-shrink-0 font-semibold">Canal</div>
                          <div className="flex-1 flex relative">
                          {Array.from({ length: hourRange + 1 }, (_, i) => {
                            const hour = timelineData.minTime + i;
                            const displayHour = hour >= 24 ? hour - 24 : hour;
                            return (
                              <div
                                key={hour}
                                className="text-xs text-muted-foreground"
                                style={{ width: `${hourWidth}px` }}
                              >
                                {displayHour.toString().padStart(2, '0')}:00
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Channel rows */}
                      {dayChannels.map(({ channel, events }) => (
                        <div key={`${date}-${channel}`} className="flex items-start mb-6">
                          <div className="w-32 flex-shrink-0 font-medium pt-2">
                            {channel}
                          </div>
                          <div className="flex-1 relative" style={{ height: '60px' }}>
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex">
                              {Array.from({ length: hourRange + 1 }, (_, i) => (
                                <div
                                  key={i}
                                  className="border-l border-border/30"
                                  style={{ width: `${hourWidth}px` }}
                                />
                              ))}
                            </div>

                            {/* Events */}
                            {events.map((event) => {
                              const left = (event.startHour - timelineData.minTime) * hourWidth;
                              const width = (event.endHour - event.startHour) * hourWidth;
                              
                              return (
                                 <div
                                   key={event.ID}
                                   className="absolute top-1 h-14 rounded border border-white/20 cursor-pointer hover:border-white/40 hover:shadow-lg transition-all overflow-hidden"
                                   style={{
                                     left: `${left}px`,
                                     width: `${width}px`,
                                     backgroundColor: getEventColor(event),
                                   }}
                                   onClick={() => {
                                     setSelectedEvent(event);
                                     setModalOpen(true);
                                   }}
                                 >
                                   <div className="px-2 py-1 text-white text-xs h-full flex flex-col justify-center">
                                     <div className="font-semibold truncate flex items-center">
                                       {getPremiereIcon(event.PREMIERE)}
                                       {event.PROGRAMME || event.SERIES || event.TXSLOT_NAME || 'Sem programação'}
                                     </div>
                                     <div className="text-[10px] opacity-90">
                                       {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                     </div>
                                   </div>
                                 </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      <ScheduleEventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
