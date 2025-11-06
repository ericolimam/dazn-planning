import { useState } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/ScheduleFilters";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { Loader2 } from "lucide-react";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { Star, Sparkles, TrendingUp } from "lucide-react";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

export interface ScheduleEvent {
  ID: number;
  SERIES: string;
  PROGRAMME: string;
  PROG_REQTYPE: string;
  WEEK: number;
  DATE: string;
  START_TIME: string;
  BILLED_START: string;
  DURATION: string;
  CHANNEL: string;
  TXSLOT_NAME: string;
  SERIES_REQTYPE: string;
  GENRE: string;
  PROGCATEGORY: string;
  PREMIERE?: string; // Optional - may not be available in API
}

const getGenreColor = (genre: string) => {
  const colors: Record<string, string> = {
    'FUTEBOL': '#10b981',        // Green
    'BASQUETEBOL': '#f59e0b',    // Orange
    'ATLETISMO': '#3b82f6',      // Blue
    'BOXE': '#ef4444',           // Red
    'PROGRAMAS': '#8b5cf6',      // Purple
    'MMA': '#dc2626',            // Dark Red
    'TÉNIS': '#06b6d4',          // Cyan
    'DARDOS': '#f97316',         // Orange-Red
    'HÓQUEI': '#0ea5e9',         // Sky Blue
    'RÂGUEBI': '#059669',        // Emerald
    'ANDEBOL': '#6366f1',        // Indigo
    'TÉNIS DE MESA': '#14b8a6',  // Teal
    'VOLEIBOL': '#ec4899',       // Pink
    'CICLISMO': '#eab308',       // Yellow
    'AUTOMOBILISMO': '#64748b',  // Slate
  };
  
  return colors[genre] || '#6b7280';
};

const getPremiereIcon = (premiere: string | undefined) => {
  if (!premiere) return null;
  
  const icons: Record<string, JSX.Element> = {
    'ESTREIA': <Star className="h-3 w-3 flex-shrink-0" fill="gold" color="gold" />,
    'EXCLUSIVO': <Sparkles className="h-3 w-3 flex-shrink-0" fill="white" color="white" />,
    'DESTAQUE': <TrendingUp className="h-3 w-3 flex-shrink-0" color="yellow" />,
  };
  
  return icons[premiere] || null;
};

const parseDateTime = (dateStr: string, timeStr: string) => {
  // Parse date MM/DD/YYYY
  const [month, day, year] = dateStr.split('/');
  // Parse time HH:MM:SS (with colons)
  const [hours, minutes, seconds] = timeStr.split(':').map(s => parseInt(s));
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes, seconds || 0);
};

const parseDuration = (duration: string) => {
  // Duration format HH:MM:SS.ms (with colons)
  const parts = duration.split(':').map(s => parseFloat(s));
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000; // Convert to milliseconds
};

const extractYearFromDate = (dateStr: string): number => {
  // Date format: MM/DD/YYYY
  const parts = dateStr.split('/');
  return parseInt(parts[2]);
};

// Get current week number
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
};

export default function Schedule() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(getCurrentWeek());
  const [selectedChannel, setSelectedChannel] = useState<string | null>("DAZN 1");
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timeStep, setTimeStep] = useState<15 | 30 | 60>(30); // 15, 30 or 60 minutes

  // First query: Load all data for filters
  const { data: allScheduleData } = useQuery({
    queryKey: ["schedule-all"],
    queryFn: async () => {
      console.log('Loading all schedule data for filters...');
      const { data, error } = await supabase.functions.invoke("list-schedule", {
        body: {},
      });

      if (error) {
        console.error('Error loading schedule:', error);
        throw error;
      }
      
      console.log('=== SCHEDULE DATA LOADED ===');
      console.log('Success:', data?.success !== false);
      console.log('Total rows received:', data?.ROWS?.length || 0);
      
      if (data?.ROWS && data.ROWS.length > 0) {
        console.log('First 3 raw events from API:');
        data.ROWS.slice(0, 3).forEach((row: any, i: number) => {
          console.log(`  ${i + 1}.`, {
            ID: row.ID,
            PROGRAMME: row.PROGRAMME,
            SERIES: row.SERIES,
            DATE: row.DATE,
            START_TIME: row.START_TIME,
            DURATION: row.DURATION,
            CHANNEL: row.CHANNEL,
            WEEK: row.WEEK
          });
        });
      } else {
        console.log('NO ROWS in response!');
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract unique weeks, channels, and years
  const weeks = allScheduleData?.ROWS 
    ? [...new Set<number>(allScheduleData.ROWS.map((r: ScheduleEvent) => r.WEEK).filter((w: number) => w))].sort((a: number, b: number) => a - b)
    : [];
  
  const channels = allScheduleData?.ROWS 
    ? [...new Set<string>(allScheduleData.ROWS.map((r: ScheduleEvent) => r.CHANNEL).filter((c: string) => c))].sort()
    : [];

  const years = allScheduleData?.ROWS 
    ? [...new Set<number>(allScheduleData.ROWS.map((r: ScheduleEvent) => extractYearFromDate(r.DATE)).filter((y: number) => y))].sort((a: number, b: number) => b - a)
    : [];

  console.log('Filters available:', { weeks: weeks.length, channels: channels.length, years: years.length });

  // Second query: Filter data based on selections
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["schedule-filtered", selectedWeek, selectedChannel, selectedYear],
    queryFn: async () => {
      console.log('Filtering schedule data:', { selectedWeek, selectedChannel, selectedYear });
      
      // Apply filters locally on cached data
      if (!allScheduleData?.ROWS) return { ROWS: [] };
      
      let filtered = [...allScheduleData.ROWS];
      
      if (selectedWeek !== null) {
        filtered = filtered.filter((r: ScheduleEvent) => r.WEEK === selectedWeek);
      }
      
      if (selectedChannel !== null) {
        filtered = filtered.filter((r: ScheduleEvent) => r.CHANNEL === selectedChannel);
      }
      
      if (selectedYear !== null) {
        filtered = filtered.filter((r: ScheduleEvent) => extractYearFromDate(r.DATE) === selectedYear);
      }
      
      console.log('Filtered results:', filtered.length, 'events');
      return { ROWS: filtered };
    },
    enabled: !!allScheduleData,
  });

  const events = scheduleData?.ROWS?.filter((event: ScheduleEvent) => event.PROG_REQTYPE === 'PROGRAMA')
    .map((event: ScheduleEvent) => {
    try {
      const start = parseDateTime(event.DATE, event.START_TIME);
      const duration = parseDuration(event.DURATION);
      const end = new Date(start.getTime() + duration);

      const calendarEvent = {
        id: event.ID,
        title: event.PROGRAMME || event.SERIES || event.TXSLOT_NAME || 'Sem título',
        start,
        end,
        resource: event,
      };

      return calendarEvent;
    } catch (error) {
      console.error('Error parsing event:', event, error);
      return null;
    }
  }).filter(e => e !== null) || [];

  console.log('=== CALENDAR EVENTS DEBUG ===');
  console.log('Total events after mapping:', events.length);
  if (events.length > 0) {
    console.log('First event:', events[0]);
    console.log('Sample event dates:', {
      start: events[0].start,
      end: events[0].end,
      title: events[0].title
    });
  } else {
    console.log('NO EVENTS MAPPED!');
    console.log('scheduleData:', scheduleData);
    console.log('scheduleData?.ROWS?.length:', scheduleData?.ROWS?.length);
    if (scheduleData?.ROWS && scheduleData.ROWS.length > 0) {
      console.log('Sample raw event:', scheduleData.ROWS[0]);
    }
  }

  const eventStyleGetter = (event: any) => {
    const genre = event.resource.GENRE;
    const backgroundColor = getGenreColor(genre);
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  };

  const EventComponent = ({ event }: any) => {
    const premiereIcon = getPremiereIcon(event.resource?.PREMIERE);
    return (
      <div className="flex items-center gap-1 w-full overflow-hidden">
        {premiereIcon && (
          <span className="flex-shrink-0">
            {premiereIcon}
          </span>
        )}
        <span className="truncate text-xs">{event.title}</span>
      </div>
    );
  };

  const handleDoubleClickEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <img src={daznLogo} alt="DAZN" className="h-10 w-10" />
              <nav className="flex gap-6">
                <NavLink to="/">Programas</NavLink>
                <NavLink to="/schedule">Grade de Programação</NavLink>
                <NavLink to="/timeline">Timeline</NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Grade de Programação
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie a programação por canal e período
          </p>
        </div>

        <ScheduleFilters
          selectedWeek={selectedWeek}
          selectedChannel={selectedChannel}
          selectedYear={selectedYear}
          onWeekChange={setSelectedWeek}
          onChannelChange={setSelectedChannel}
          onYearChange={setSelectedYear}
          weeks={weeks}
          channels={channels}
          years={years}
        />

        {view === "week" && (
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">
              Intervalo de Tempo:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeStep(15)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeStep === 15
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                15 minutos
              </button>
              <button
                onClick={() => setTimeStep(30)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeStep === 30
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                30 minutos
              </button>
              <button
                onClick={() => setTimeStep(60)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeStep === 60
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                1 hora
              </button>
            </div>
          </div>
        )}

        <Card className="p-6 bg-card border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div style={{ height: '700px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                onDoubleClickEvent={handleDoubleClickEvent}
                views={['month', 'week', 'day']}
                step={timeStep}
                timeslots={1}
                components={{
                  event: EventComponent,
                }}
                messages={{
                  next: "Próximo",
                  previous: "Anterior",
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia",
                  agenda: "Agenda",
                  date: "Data",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "Não há eventos neste período",
                  showMore: (total) => `+ ${total} mais`,
                }}
                formats={{
                  dayHeaderFormat: (date) => moment(date).format('dddd, DD/MM'),
                  dayRangeHeaderFormat: ({ start, end }) =>
                    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
                  agendaHeaderFormat: ({ start, end }) =>
                    `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
                }}
              />
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
