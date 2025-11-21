import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/ScheduleFilters";
import { ScheduleEventModal } from "@/components/ScheduleEventModal";
import { Loader2, Star, Sparkles, TrendingUp, FileDown, Clock } from "lucide-react";
import daznLogo from "@/assets/dazn-logo.png";
import { NavLink } from "@/components/NavLink";
import { UserMenu } from "@/components/UserMenu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getTeamLogo } from "@/utils/teamLogos";
import { useCurrentTimeIndicator } from "@/hooks/useCurrentTimeIndicator";

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

const getEventColor = (event: ScheduleEvent) => {
  if (event.TXSLOT_NAME === 'SEM EMISSÃO') {
    return '#000000';
  }
  return getGenreColor(event.GENRE);
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
  
  // Extract time from timeStr - it could be in format "HH:MM:SS" or "MM/DD/YYYY HH:MM:SS AM/PM"
  let hours = 0, minutes = 0, seconds = 0;
  
  if (timeStr.includes('/')) {
    // Format: "12/30/1899 1:00:53 AM" - extract only the time part
    const timePart = timeStr.split(' ').slice(1).join(' '); // Get "1:00:53 AM"
    const isPM = timePart.includes('PM');
    const isAM = timePart.includes('AM');
    const timeOnly = timePart.replace(/AM|PM/g, '').trim();
    const [h, m, s] = timeOnly.split(':').map(t => parseInt(t));
    
    hours = h;
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    minutes = m;
    seconds = s || 0;
  } else {
    // Format: "HH:MM:SS"
    const parts = timeStr.split(':').map(s => parseInt(s));
    hours = parts[0] || 0;
    minutes = parts[1] || 0;
    seconds = parts[2] || 0;
  }
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes, seconds);
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
  const { currentPositionMinutes, isEventCurrentlyAiring } = useCurrentTimeIndicator();

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

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const img = new Image();
    img.src = daznLogo;
    
    const imgWidth = 20;
    const imgHeight = 8;
    doc.addImage(img, 'PNG', 14, 10, imgWidth, imgHeight);

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Guia de Programação', 40, 15);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const filterText = `Semana ${selectedWeek} | ${selectedChannels.join(', ')}`;
    doc.text(filterText, 14, 24);

    // Create channel headers with dates from channelDateColumns
    const channelHeaders = channelDateColumns.map((col: any) => {
      const dateStr = col.date;
      const dateFormatted = dateStr 
        ? (() => {
            const [month, day, year] = dateStr.split('/');
            return `${day}/${month}/${year}`;
          })()
        : '';
      
      // Get weekday abbreviation in Portuguese
      const weekdayAbbr = dateStr 
        ? (() => {
            const [month, day, year] = dateStr.split('/');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            return days[date.getDay()];
          })()
        : '';
      
      return `${col.channel}\n${weekdayAbbr} ${dateFormatted}`;
    });

    const tableHead = [['Hora', ...channelHeaders]];
    const tableBody: any[] = [];

    // Track which events have been added to avoid duplicates
    const addedEvents = new Map<string, Set<number>>();
    channelDateColumns.forEach((col: any) => {
      const key = `${col.channel}_${col.date}`;
      addedEvents.set(key, new Set());
    });

    // For each time slot, create a row
    timeSlots.forEach((timeSlot, slotIndex) => {
      const row = [timeSlot];
      
      const slotStartMinutes = (() => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        let adjustedHours = hours;
        if (hours < 5) adjustedHours += 24;
        return (adjustedHours - 5) * 60 + minutes;
      })();
      const slotEndMinutes = slotStartMinutes + 30;

      // For each channel+date column, find the event that starts in this time slot
      channelDateColumns.forEach((col: any) => {
        const key = `${col.channel}_${col.date}`;
        const events = col.events || [];
        const channelAdded = addedEvents.get(key)!;
        
        // Find event that starts at this time slot
        const eventStartingHere = events.find((event: any) => {
          const eventStart = event.positionMinutes;
          return eventStart >= slotStartMinutes && eventStart < slotEndMinutes && !channelAdded.has(event.ID);
        });

        if (eventStartingHere) {
          channelAdded.add(eventStartingHere.ID);
          const title = eventStartingHere.TXSLOT_NAME === 'SEM EMISSÃO' ? 'SEM EMISSÃO' : eventStartingHere.PROGRAMME;
          const startTime = (eventStartingHere.START_TC || eventStartingHere.START_TIME).substring(0, 5);
          const duration = Math.round(eventStartingHere.durationMinutes);
          const genre = eventStartingHere.GENRE || '';
          row.push(`${title}\n${startTime} - ${duration}min\n${genre}`);
        } else {
          // Check if this slot is part of a previous event
          const ongoingEvent = events.find((event: any) => {
            const eventStart = event.positionMinutes;
            const eventEnd = eventStart + event.durationMinutes;
            return eventStart < slotStartMinutes && eventEnd > slotStartMinutes && channelAdded.has(event.ID);
          });
          
          row.push(ongoingEvent ? '' : '');
        }
      });
      
      tableBody.push(row);
    });

    autoTable(doc, {
      startY: 30,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: { 
        fontSize: 6, 
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        valign: 'top'
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        fontSize: 7, 
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center', fontStyle: 'bold', valign: 'middle' }
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        // Color cells based on content
        if (data.section === 'body' && data.column.index > 0) {
          const cellText = String(data.cell.text.join('\n'));
          
        if (cellText && cellText.trim() !== '') {
            const col = channelDateColumns[data.column.index - 1] as any;
            const events = col?.events || [];
            
            // Find the event that corresponds to this cell
            const lines = cellText.split('\n');
            if (lines.length >= 3) {
              const title = lines[0];
              const genre = lines[2];
              
              // Check if it's "SEM EMISSÃO"
              if (title === 'SEM EMISSÃO') {
                data.cell.styles.fillColor = [0, 0, 0];
                data.cell.styles.textColor = [255, 255, 255];
              } else {
                // Apply genre color
                const color = getGenreColor(genre);
                if (color !== '#6b7280') {
                  const rgb = parseInt(color.slice(1), 16);
                  const r = (rgb >> 16) & 255;
                  const g = (rgb >> 8) & 255;
                  const b = rgb & 255;
                  data.cell.styles.fillColor = [r, g, b];
                  data.cell.styles.textColor = [255, 255, 255];
                }
              }
            }
          }
        }
      },
      didDrawCell: (data) => {
        // Merge cells vertically for events that span multiple time slots
        if (data.section === 'body' && data.column.index > 0) {
          const cellText = String(data.cell.text.join('\n'));
          
        if (cellText && cellText.trim() !== '') {
            const col = channelDateColumns[data.column.index - 1] as any;
            const events = col?.events || [];
            const rowIndex = data.row.index;
            
            const slotStartMinutes = (() => {
              const timeSlot = timeSlots[rowIndex];
              const [hours, minutes] = timeSlot.split(':').map(Number);
              let adjustedHours = hours;
              if (hours < 5) adjustedHours += 24;
              return (adjustedHours - 5) * 60 + minutes;
            })();
            
            const event = events.find((e: any) => {
              const eventStart = e.positionMinutes;
              return eventStart >= slotStartMinutes && eventStart < slotStartMinutes + 30;
            });
            
            if (event) {
              const slotsToSpan = Math.ceil(event.durationMinutes / 30);
              if (slotsToSpan > 1) {
                const cellHeight = data.cell.height;
                const totalHeight = cellHeight * slotsToSpan;
                // Update cell height to span multiple rows
                data.cell.height = totalHeight;
              }
            }
          }
        }
      }
    });

    doc.save(`grade-programacao-semana-${selectedWeek}.pdf`);
  };

  // Process events by channel and date - create separate entries for each day
  const eventsByChannelAndDate = scheduleData?.ROWS?.reduce((acc: any, event: ScheduleEvent) => {
    if (!selectedChannels.includes(event.CHANNEL)) return acc;
    // Show PROGRAMA type or events with TXSLOT_NAME = "SEM EMISSÃO"
    if (event.PROG_REQTYPE !== "PROGRAMA" && event.TXSLOT_NAME !== "SEM EMISSÃO") return acc;
    
    // Use TXDAY_DATE and START_TC if available, fallback to DATE and START_TIME
    const dateStr = event.TXDAY_DATE || event.DATE;
    const timeStr = event.START_TC || event.START_TIME;
    const durationStr = event.DURATION_TC || event.DURATION;
    
    // Skip events without valid data
    if (!dateStr || !timeStr || !durationStr) return acc;
    
    const startTime = parseDateTime(dateStr, timeStr);
    const duration = parseDuration(durationStr);
    
    // Create a key combining channel and date
    const channelDateKey = `${event.CHANNEL}_${dateStr}`;
    
    if (!acc[channelDateKey]) {
      acc[channelDateKey] = {
        channel: event.CHANNEL,
        date: dateStr,
        events: []
      };
    }
    
    // Calculate position in minutes from 5:00 AM
    let hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    
    // Adjust for 5am start
    if (hour < 5) hour += 24;
    const positionMinutes = (hour - 5) * 60 + minutes;
    
    acc[channelDateKey].events.push({
      ...event,
      startTime,
      duration,
      positionMinutes,
      durationMinutes: duration / (1000 * 60)
    });
    
    return acc;
  }, {}) || {};

  // Convert to array and sort by date then channel for display
  const channelDateColumns = Object.values(eventsByChannelAndDate)
    .sort((a: any, b: any) => {
      // First sort by date
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      // Then by channel
      return a.channel.localeCompare(b.channel);
    });

  // For PDF export compatibility - keep the old structure
  const eventsByChannel = channelDateColumns.reduce((acc: any, col: any) => {
    if (!acc[col.channel]) {
      acc[col.channel] = [];
    }
    acc[col.channel].push(...col.events);
    return acc;
  }, {});

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Guia de Programação</h1>
          {!isLoading && channelDateColumns && channelDateColumns.length > 0 && (
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}
        </div>
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
              <div className="flex min-w-max">
                {/* Time column */}
                <div className="flex-shrink-0 w-20 border-r sticky left-0 bg-background z-30">
                  <div className="h-12 border-b sticky top-0 bg-background z-40 flex items-center justify-center font-semibold text-sm">
                    Hora
                  </div>
                  {timeSlots.map((slot) => (
                    <div key={slot} className="h-16 border-b flex items-center justify-center text-xs font-medium bg-background">
                      {slot}
                    </div>
                  ))}
                </div>

                {/* Channel+Date columns */}
                {channelDateColumns.map((col: any) => {
                  const dateStr = col.date;
                  const dateFormatted = dateStr 
                    ? (() => {
                        const [month, day, year] = dateStr.split('/');
                        return `${day}/${month}/${year}`;
                      })()
                    : '';
                  
                  // Get weekday abbreviation in Portuguese
                  const weekdayAbbr = dateStr 
                    ? (() => {
                        const [month, day, year] = dateStr.split('/');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
                        return days[date.getDay()];
                      })()
                    : '';
                  
                  return (
                    <div key={`${col.channel}_${col.date}`} className="flex-1 min-w-[180px] border-r relative">
                      {/* Channel header */}
                      <div className="h-12 border-b sticky top-0 bg-background z-30 flex flex-col items-center justify-center px-2">
                        <div className="font-semibold text-sm">{col.channel}</div>
                        {dateFormatted && (
                          <div className="text-xs text-muted-foreground">
                            {weekdayAbbr} {dateFormatted}
                          </div>
                        )}
                      </div>
                    
                    {/* Time grid */}
                    <div className="relative">
                      {timeSlots.map((slot) => (
                        <div key={slot} className="h-16 border-b" />
                      ))}
                      
                      {/* Current time indicator line */}
                      {(() => {
                        // Only show indicator if this column's date matches today
                        const today = new Date().toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: 'numeric' 
                        }).replace(/\//g, '/');
                        const [todayMonth, todayDay, todayYear] = today.split('/');
                        const todayFormatted = `${todayMonth}/${todayDay}/${todayYear}`;
                        
                        const isToday = col.date === todayFormatted;
                        
                        return isToday && currentPositionMinutes >= 0 && currentPositionMinutes <= (24 * 60) && (
                          <div
                            className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                            style={{
                              top: `${(currentPositionMinutes / 30) * 64}px`,
                            }}
                          >
                            <div className="absolute -left-1 -top-2 bg-red-500 text-white text-[9px] px-1 rounded flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              AGORA
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Programs positioned absolutely */}
                      {col.events?.map((event: any, idx: number) => {
                        const color = getEventColor(event);
                        const topPosition = (event.positionMinutes / 30) * 64; // 64px = h-16
                        const height = Math.max((event.durationMinutes / 30) * 64, 32); // Minimum 32px
                        const isCurrentlyAiring = isEventCurrentlyAiring(event.startTime, new Date(event.startTime.getTime() + event.duration));
                        
                        return (
                          <div
                            key={`${event.ID}-${idx}`}
                            className={`absolute left-0 right-0 mx-1 p-1.5 rounded text-white cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shadow-sm ${
                              isCurrentlyAiring 
                                ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-background border-2 border-red-500' 
                                : ''
                            }`}
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
                            <div className="flex items-start gap-1.5 mb-0.5">
                              {isCurrentlyAiring && <Clock className="h-3 w-3 animate-pulse flex-shrink-0" />}
                              {getPremiereIcon(event.PREMIERE)}
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {getTeamLogo(event.PROGRAMME, 24) && (
                                  <img 
                                    src={getTeamLogo(event.PROGRAMME, 24)!} 
                                    alt="" 
                                    className="w-5 h-5 flex-shrink-0 bg-white rounded p-0.5"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="font-semibold text-[11px] truncate leading-tight">
                                  {event.TXSLOT_NAME === 'SEM EMISSÃO' ? 'SEM EMISSÃO' : event.PROGRAMME}
                                </div>
                              </div>
                            </div>
                            <div className="text-[9px] opacity-90">
                              {event.START_TIME.substring(0, 5)} - {Math.round(event.durationMinutes)}min
                            </div>
                            {height > 50 && (
                              <div className="text-[9px] opacity-75 truncate mt-0.5">
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
