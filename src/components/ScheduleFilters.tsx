import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ScheduleFiltersProps {
  selectedWeek: number | null;
  selectedChannel: string | null;
  selectedYear: number | null;
  onWeekChange: (week: number | null) => void;
  onChannelChange: (channel: string | null) => void;
  onYearChange: (year: number | null) => void;
  weeks: number[];
  channels: string[];
  years: number[];
}

export function ScheduleFilters({
  selectedWeek,
  selectedChannel,
  selectedYear,
  onWeekChange,
  onChannelChange,
  onYearChange,
  weeks,
  channels,
  years,
}: ScheduleFiltersProps) {
  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year-filter" className="text-sm font-medium">
            Ano
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedYear?.toString() || "all"}
              onValueChange={(value) => onYearChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger id="year-filter" className="bg-background border-input">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedYear && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onYearChange(null)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="week-filter" className="text-sm font-medium">
            Semana
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedWeek?.toString() || "all"}
              onValueChange={(value) => onWeekChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger id="week-filter" className="bg-background border-input">
                <SelectValue placeholder="Todas as semanas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as semanas</SelectItem>
                {weeks.map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Semana {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWeek && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onWeekChange(null)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel-filter" className="text-sm font-medium">
            Canal
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedChannel || "all"}
              onValueChange={(value) => onChannelChange(value === "all" ? null : value)}
            >
              <SelectTrigger id="channel-filter" className="bg-background border-input">
                <SelectValue placeholder="Todos os canais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChannel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChannelChange(null)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtros Ativos</Label>
          <div className="flex flex-wrap gap-2 items-center min-h-10">
            {!selectedYear && !selectedWeek && !selectedChannel && (
              <span className="text-sm text-muted-foreground">Nenhum filtro aplicado</span>
            )}
            {selectedYear && (
              <span className="text-sm bg-muted px-2 py-1 rounded">
                Ano {selectedYear}
              </span>
            )}
            {selectedWeek && (
              <span className="text-sm bg-muted px-2 py-1 rounded">
                Semana {selectedWeek}
              </span>
            )}
            {selectedChannel && (
              <span className="text-sm bg-muted px-2 py-1 rounded">
                {selectedChannel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
