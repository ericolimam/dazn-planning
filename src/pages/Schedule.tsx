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
}

const getGenreColor = (genre: string) => {
  const colors: Record<string, string> = {
    'FUTEBOL': '#475569',
    'BASQUETEBOL': '#52525b',
    'ATLETISMO': '#4b5563',
    'BOXE': '#525252',
    'PROGRAMAS': '#57534e',
    'MMA': '#64748b',
    'TÉNIS': '#71717a',
    'DARDOS': '#6b7280',
    'HÓQUEI': '#737373',
    'RÂGUEBI': '#78716c',
    'ANDEBOL': '#334155',
    'TÉNIS DE MESA': '#3f3f46',
    'VOLEIBOL': '#374151',
    'CICLISMO': '#404040',
    'AUTOMOBILISMO': '#44403c',
  };
  
  return colors[genre] || '#6b7280';
};

const parseDateTime = (dateStr: string, timeStr: string) => {
  // Parse date MM/DD/YYYY
  const [month, day, year] = dateStr.split('/');
  // Parse time HHMMSS
  const hours = timeStr.substring(0, 2);
  const minutes = timeStr.substring(2, 4);
  const seconds = timeStr.substring(4, 6);
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
};

const parseDuration = (duration: string) => {
  // Duration format HHMM
  const hours = parseInt(duration.substring(0, 2));
  const minutes = parseInt(duration.substring(2, 4));
  return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
};

const extractYearFromDate = (dateStr: string): number => {
  // Date format: MM/DD/YYYY
  const parts = dateStr.split('/');
  return parseInt(parts[2]);
};

export default function Schedule() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // First query: Load all data for filters
  const { data: allScheduleData } = useQuery({
    queryKey: ["schedule-all"],
    queryFn: async () => {
      console.log('Loading all schedule data for filters...');
      const { data, error } = await supabase.functions.invoke("list-schedule", {
        body: {},
      });

      if (error) throw error;
      console.log('All schedule data loaded:', data?.ROWS?.length || 0, 'events');
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

  const events = scheduleData?.ROWS?.map((event: ScheduleEvent) => {
    const start = parseDateTime(event.DATE, event.START_TIME);
    const duration = parseDuration(event.DURATION);
    const end = new Date(start.getTime() + duration);

    return {
      id: event.ID,
      title: event.PROGRAMME || event.SERIES || event.TXSLOT_NAME,
      start,
      end,
      resource: event,
    };
  }) || [];

  const eventStyleGetter = (event: any) => {
    const genre = event.resource.GENRE;
    const backgroundColor = getGenreColor(genre);
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
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
