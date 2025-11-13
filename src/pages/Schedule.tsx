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
      if (selectedChannels.length > 0) filters.channel = selectedChannels;
      if (selectedYear !== null) filters.year = selectedYear;
      const { data, error } = await supabase.functions.invoke("list-schedule", { body: filters });
      if (error) throw error;
      return data;
    },
    enabled: selectedWeek !== null && selectedChannels.length > 0 && selectedYear !== null,
    staleTime: 5 * 60 * 1000,
  });

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 5; hour < 29; hour++) {
      slots.push(`${String(hour >= 24 ? hour - 24 : hour).padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const groupedEvents = scheduleData?.ROWS?.reduce((acc: any, event: ScheduleEvent) => {
    if (!selectedChannels.includes(event.CHANNEL)) return acc;
    if (!acc[event.CHANNEL]) acc[event.CHANNEL] = {};
    
    const startTime = parseDateTime(event.DATE, event.START_TIME);
    let adjustedHour = startTime.getHours();
    if (adjustedHour < 5) adjustedHour += 24;
    
    const timeKey = `${String(adjustedHour).padStart(2, '0')}:00`;
    if (!acc[event.CHANNEL][timeKey]) acc[event.CHANNEL][timeKey] = [];
    
    acc[event.CHANNEL][timeKey].push({ ...event, startTime, duration: parseDuration(event.DURATION) });
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
              <div className="min-w-max">
                <div className="flex border-b sticky top-0 bg-background z-10">
                  <div className="w-32 flex-shrink-0 p-2 font-semibold border-r">Canal</div>
                  {timeSlots.map((slot) => (
                    <div key={slot} className="w-40 flex-shrink-0 p-2 text-center font-semibold border-r text-xs">{slot}</div>
                  ))}
                </div>

                {selectedChannels.map((channel) => (
                  <div key={channel} className="flex border-b hover:bg-muted/50">
                    <div className="w-32 flex-shrink-0 p-2 font-medium border-r flex items-center">{channel}</div>
                    {timeSlots.map((slot) => {
                      const events = groupedEvents[channel]?.[slot] || [];
                      return (
                        <div key={slot} className="w-40 flex-shrink-0 border-r min-h-[80px] p-1">
                          {events.map((event: any, idx: number) => (
                            <div
                              key={`${event.ID}-${idx}`}
                              className="mb-1 p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity text-xs overflow-hidden"
                              style={{ backgroundColor: getGenreColor(event.GENRE), minHeight: '60px' }}
                              onClick={() => { setSelectedEvent(event); setModalOpen(true); }}
                            >
                              <div className="flex items-start gap-1 mb-1">
                                {getPremiereIcon(event.PREMIERE)}
                                <div className="font-semibold truncate flex-1">{event.PROGRAMME}</div>
                              </div>
                              <div className="text-[10px] opacity-90">{event.START_TIME.substring(0, 5)}</div>
                              <div className="text-[10px] opacity-75 truncate">{event.GENRE}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
