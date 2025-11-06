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
  onWeekChange: (week: number | null) => void;
  onChannelChange: (channel: string | null) => void;
  weeks: number[];
  channels: string[];
}

export function ScheduleFilters({
  selectedWeek,
  selectedChannel,
  onWeekChange,
  onChannelChange,
  weeks,
  channels,
}: ScheduleFiltersProps) {
  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex gap-2 items-center h-10">
            {!selectedWeek && !selectedChannel && (
              <span className="text-sm text-muted-foreground">Nenhum filtro aplicado</span>
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
