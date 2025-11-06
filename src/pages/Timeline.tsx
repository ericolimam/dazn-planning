import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/ScheduleFilters";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { Loader2 } from "lucide-react";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { ScheduleEvent } from "./Schedule";

const getGenreColor = (genre: string) => {
  const colors: Record<string, string> = {
    'FUTEBOL': '#10b981',
    'BASQUETEBOL': '#f59e0b',
    'ATLETISMO': '#3b82f6',
    'BOXE': '#ef4444',
    'PROGRAMAS': '#8b5cf6',
    'MMA': '#dc2626',
    'TÉNIS': '#06b6d4',
    'DARDOS': '#f97316',
    'HÓQUEI': '#0ea5e9',
    'RÂGUEBI': '#059669',
    'ANDEBOL': '#6366f1',
    'TÉNIS DE MESA': '#14b8a6',
    'VOLEIBOL': '#ec4899',
    'CICLISMO': '#eab308',
    'AUTOMOBILISMO': '#64748b',
  };
  return colors[genre] || '#6b7280';
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

const extractYearFromDate = (dateStr: string): number => {
  const parts = dateStr.split('/');
  return parseInt(parts[2]);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function Timeline() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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
    ? [...new Set<number>(allScheduleData.ROWS.map((r: ScheduleEvent) => extractYearFromDate(r.DATE)).filter((y: number) => y))].sort((a: number, b: number) => b - a)
    : [];

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["schedule-filtered", selectedWeek, selectedChannel, selectedYear],
    queryFn: async () => {
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
      
      return { ROWS: filtered };
    },
    enabled: !!allScheduleData,
  });

  const timelineData = useMemo(() => {
    if (!scheduleData?.ROWS) return { days: [], minTime: 0, maxTime: 24 };

    const events = scheduleData.ROWS
      .filter((event: ScheduleEvent) => event.PROG_REQTYPE === 'PROGRAMA')
      .map((event: ScheduleEvent) => {
        try {
          const start = parseDateTime(event.DATE, event.START_TIME);
          const duration = parseDuration(event.DURATION);
          const end = new Date(start.getTime() + duration);
          
          return {
            ...event,
            startDate: start,
            endDate: end,
            startHour: start.getHours() + start.getMinutes() / 60,
            endHour: end.getHours() + end.getMinutes() / 60,
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

    // Find time range across all events
    const allHours = filteredEvents.flatMap(e => [e.startHour, e.endHour]);
    const minTime = allHours.length > 0 ? Math.floor(Math.min(...allHours)) : 0;
    const maxTime = allHours.length > 0 ? Math.ceil(Math.max(...allHours)) : 24;

    return { days, minTime, maxTime };
  }, [scheduleData, channels, selectedDate, selectedWeek]);

  const hourRange = timelineData.maxTime - timelineData.minTime;
  const hourWidth = 120; // pixels per hour

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
                            return (
                              <div
                                key={hour}
                                className="text-xs text-muted-foreground"
                                style={{ width: `${hourWidth}px` }}
                              >
                                {hour.toString().padStart(2, '0')}:00
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
                                  className="absolute top-1 h-14 rounded border border-gray-700 cursor-pointer hover:border-gray-600 hover:shadow-lg transition-all overflow-hidden"
                                  style={{
                                    left: `${left}px`,
                                    width: `${width}px`,
                                    backgroundColor: getGenreColor(event.GENRE),
                                  }}
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setModalOpen(true);
                                  }}
                                >
                                  <div className="px-2 py-1 text-white text-xs h-full flex flex-col justify-center">
                                    <div className="font-semibold truncate">
                                      {event.PROGRAMME || event.SERIES}
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
