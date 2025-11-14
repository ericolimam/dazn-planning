import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/ScheduleFilters";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { Loader2, Star, Sparkles, TrendingUp } from "lucide-react";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  PREMIERE?: string;
  TXDAY_DATE?: string;
  START_TC?: string;
  DURATION_TC?: string;
}

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
    '#e11d48', '#06b6d4', '#fb923c', '#0284c7', '#16a34a',
    '#6366f1', '#14b8a6', '#ec4899', '#facc15', '#64748b',
    '#f43f5e', '#84cc16', '#22c55e', '#f97316', '#a855f7',
    '#0ea5e9', '#eab308', '#d946ef', '#fb7185', '#4ade80',
    '#fbbf24', '#c084fc', '#38bdf8', '#a3e635', '#34d399',
    '#fcd34d', '#818cf8', '#f472b6', '#fdba74', '#2dd4bf',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

const getGenreColor = (genre: string) => {
  if (!genre) return '#6b7280';
  
  const fixedColors: Record<string, string> = {
    'FUTEBOL': '#10b981', 'BASQUETEBOL': '#f59e0b', 'ATLETISMO': '#3b82f6',
    'BOXE': '#ef4444', 'PROGRAMAS': '#8b5cf6', 'MMA': '#e11d48',
    'TÉNIS': '#06b6d4', 'TENNIS': '#06b6d4', 'DARDOS': '#fb923c',
    'HÓQUEI': '#0284c7', 'RÂGUEBI': '#16a34a', 'ANDEBOL': '#6366f1',
    'TÉNIS DE MESA': '#14b8a6', 'VOLEIBOL': '#ec4899', 'CICLISMO': '#facc15',
  };
  
  return fixedColors[genre] || stringToColor(genre);
};

const getPremiereIcon = (premiere: string | undefined) => {
  if (!premiere) return null;
  const icons: Record<string, JSX.Element> = {
    'ESTREIA': <Star className="h-3 w-3" fill="gold" color="gold" />,
    'EXCLUSIVO': <Sparkles className="h-3 w-3" fill="white" color="white" />,
    'DESTAQUE': <TrendingUp className="h-3 w-3" color="yellow" />,
  };
  return icons[premiere] || null;
};

const parseDateTime = (dateStr: string, timeStr: string): Date => {
  const [month, day, year] = dateStr.split('/');
  const [hours, minutes, seconds] = timeStr.split(':').map(s => parseInt(s));
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes, seconds || 0);
};

const parseDuration = (duration: string) => {
  const parts = duration.split(':').map(s => parseFloat(s));
  return ((parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)) * 1000;
};

const extractYearFromDate = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  return parseInt(dateStr.split('/')[2]);
};

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
};

export default function Schedule() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(getCurrentWeek());
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["DAZN 1"]);
  const [selectedYear, setSelectedYear] = useState<number | null>(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allScheduleData } = useQuery({
    queryKey: ["schedule-all"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("list-schedule", { body: {} });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const weeks: number[] = allScheduleData?.ROWS ? Array.from(new Set(allScheduleData.ROWS.map((row: any) => row.WEEK).filter(Boolean))) as number[] : [];
  weeks.sort((a, b) => a - b);
  const channels: string[] = allScheduleData?.ROWS ? Array.from(new Set(allScheduleData.ROWS.map((row: any) => row.CHANNEL).filter(Boolean))) as string[] : [];
  channels.sort();
  const years: number[] = allScheduleData?.ROWS ? Array.from(new Set(allScheduleData.ROWS.map((row: any) => extractYearFromDate(row.DATE)).filter((y): y is number => y !== null))) as number[] : [];
  years.sort((a, b) => a - b);

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["schedule-filtered", selectedWeek, selectedChannels, selectedYear],
    queryFn: async () => {
      const filters: any = {};
      if (selectedWeek !== null) filters.week = selectedWeek;
      if (selectedYear !== null) filters.year = selectedYear;
      // Channel filtering is done on the frontend, not sent to backend
      const { data, error } = await supabase.functions.invoke("list-schedule", { body: filters });
      if (error) throw error;
      return data;
    },
    enabled: selectedWeek !== null && selectedChannels.length > 0 && selectedYear !== null,
    staleTime: 5 * 60 * 1000,
  });

  // Generate time slots from 05:00 to 05:00 next day (every 30 min)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 5; hour < 29; hour++) {
      const displayHour = hour >= 24 ? hour - 24 : hour;
      slots.push(`${String(displayHour).padStart(2, '0')}:00`);
      slots.push(`${String(displayHour).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Process events by channel
  const eventsByChannel = scheduleData?.ROWS?.reduce((acc: any, event: ScheduleEvent) => {
    if (!selectedChannels.includes(event.CHANNEL)) return acc;
    if (event.PROG_REQTYPE !== "PROGRAMA") return acc; // Only show PROGRAMA type
    if (!acc[event.CHANNEL]) acc[event.CHANNEL] = [];
    
    // Use TXDAY_DATE and START_TC if available, fallback to DATE and START_TIME
    const dateStr = event.TXDAY_DATE || event.DATE;
    const timeStr = event.START_TC || event.START_TIME;
    const durationStr = event.DURATION_TC || event.DURATION;
    
    const startTime = parseDateTime(dateStr, timeStr);
    const duration = parseDuration(durationStr);
    
    // Calculate position in minutes from 5:00 AM
    let hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    
    // Adjust for 5am start
    if (hour < 5) hour += 24;
    const positionMinutes = (hour - 5) * 60 + minutes;
    
    acc[event.CHANNEL].push({
      ...event,
      startTime,
      duration,
      positionMinutes,
      durationMinutes: duration / (1000 * 60)
    });
    
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <div className="mr-4 flex items-center space-x-2">
            <img src={daznLogo} alt="DAZN Logo" className="h-8" />
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            <NavLink to="/">Catálogo de Programas</NavLink>
            <NavLink to="/timeline">Timeline</NavLink>
            <NavLink to="/schedule">Grade de Programação</NavLink>
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Guia de Programação</h1>
        <Card className="p-4 mb-6">
          <ScheduleFilters
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            selectedChannels={selectedChannels}
            years={years}
            weeks={weeks}
            channels={channels}
            onYearChange={setSelectedYear}
            onWeekChange={setSelectedWeek}
            onChannelsChange={setSelectedChannels}
          />
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card className="p-4">
            <ScrollArea className="w-full h-[calc(100vh-320px)]">
              <div className="flex">
                {/* Time column */}
                <div className="flex-shrink-0 w-20 border-r">
                  <div className="h-16 border-b sticky top-0 bg-background z-20 flex items-center justify-center font-semibold text-sm">
                    Hora
                  </div>
                  {timeSlots.map((slot) => (
                    <div key={slot} className="h-16 border-b flex items-center justify-center text-xs font-medium">
                      {slot}
                    </div>
                  ))}
                </div>

                {/* Channels columns */}
                {selectedChannels.map((channel) => {
                  // Get the first event's date for this channel
                  const firstEvent = eventsByChannel[channel]?.[0];
                  const dateStr = firstEvent?.TXDAY_DATE || firstEvent?.DATE;
                  const dateFormatted = dateStr 
                    ? (() => {
                        const [month, day, year] = dateStr.split('/');
                        return `${day}/${month}/${year}`;
                      })()
                    : '';
                  
                  return (
                    <div key={channel} className="flex-1 min-w-[300px] border-r relative">
                      {/* Channel header */}
                      <div className="h-16 border-b sticky top-0 bg-background z-10 flex flex-col items-center justify-center px-2">
                        <div className="font-semibold text-sm">{channel}</div>
                        {dateFormatted && (
                          <div className="text-xs text-muted-foreground">{dateFormatted}</div>
                        )}
                      </div>
                    
                    {/* Time grid */}
                    <div className="relative">
                      {timeSlots.map((slot) => (
                        <div key={slot} className="h-16 border-b" />
                      ))}
                      
                      {/* Programs positioned absolutely */}
                      {eventsByChannel[channel]?.map((event: any, idx: number) => {
                        const color = getGenreColor(event.GENRE);
                        const topPosition = (event.positionMinutes / 30) * 64; // 64px = h-16
                        const height = Math.max((event.durationMinutes / 30) * 64, 32); // Minimum 32px
                        
                        return (
                          <div
                            key={`${event.ID}-${idx}`}
                            className="absolute left-0 right-0 mx-1 p-2 rounded text-white cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shadow-sm"
                            style={{
                              backgroundColor: color,
                              top: `${topPosition}px`,
                              height: `${height}px`,
                            }}
                            onClick={() => {
                              setSelectedEvent(event);
                              setModalOpen(true);
                            }}
                          >
                            <div className="flex items-start gap-1 mb-1">
                              {getPremiereIcon(event.PREMIERE)}
                              <div className="font-semibold text-xs truncate flex-1">
                                {event.PROGRAMME}
                              </div>
                            </div>
                            <div className="text-[10px] opacity-90">
                              {event.START_TIME.substring(0, 5)} - {Math.round(event.durationMinutes)}min
                            </div>
                            {height > 50 && (
                              <div className="text-[10px] opacity-75 truncate mt-1">
                                {event.GENRE}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
                })}
              </div>
            </ScrollArea>
          </Card>
        )}

        {selectedEvent && (
          <ScheduleEventModal event={selectedEvent} open={modalOpen} onOpenChange={setModalOpen} />
        )}
      </main>
    </div>
  );
}
