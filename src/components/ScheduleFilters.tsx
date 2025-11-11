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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ScheduleFiltersProps {
  selectedWeek: number | null;
  selectedChannels: string[];
  selectedYear: number | null;
  showOverlaps?: boolean;
  onWeekChange: (week: number | null) => void;
  onChannelsChange: (channels: string[]) => void;
  onYearChange: (year: number | null) => void;
  onShowOverlapsChange?: (show: boolean) => void;
  weeks: number[];
  channels: string[];
  years: number[];
}

export function ScheduleFilters({
  selectedWeek,
  selectedChannels,
  selectedYear,
  showOverlaps,
  onWeekChange,
  onChannelsChange,
  onYearChange,
  onShowOverlapsChange,
  weeks,
  channels,
  years,
}: ScheduleFiltersProps) {
  const handleChannelToggle = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      onChannelsChange(selectedChannels.filter(c => c !== channel));
    } else {
      onChannelsChange([...selectedChannels, channel]);
    }
  };

  return (
    <Card className="p-3 mb-6 bg-card border-border">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="year-filter" className="text-xs font-medium">
            Ano
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedYear?.toString() || "all"}
              onValueChange={(value) => onYearChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger id="year-filter" className="bg-background border-input h-8 text-xs">
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

        <div className="space-y-1.5">
          <Label htmlFor="week-filter" className="text-xs font-medium">
            Semana
          </Label>
          <div className="flex gap-2">
            <Select
              value={selectedWeek?.toString() || "all"}
              onValueChange={(value) => onWeekChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger id="week-filter" className="bg-background border-input h-8 text-xs">
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

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Canais
          </Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-background border-input h-8 text-xs">
                  {selectedChannels.length === 0 ? "Selecione canais..." : `${selectedChannels.length} canal(is) selecionado(s)`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-background border-border z-50" align="start">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {channels.map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={selectedChannels.includes(channel)}
                        onCheckedChange={() => handleChannelToggle(channel)}
                      />
                      <label
                        htmlFor={`channel-${channel}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {channel}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedChannels.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChannelsChange([])}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {onShowOverlapsChange && (
          <div className="space-y-1.5">
            <Label htmlFor="overlap-toggle" className="text-xs font-medium">
              Visualização
            </Label>
            <div className="flex items-center gap-2 h-8">
              <Switch
                id="overlap-toggle"
                checked={!showOverlaps}
                onCheckedChange={(checked) => onShowOverlapsChange(!checked)}
              />
              <span className="text-xs">Sem Overlaps</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Filtros Ativos</Label>
          <div className="flex flex-wrap gap-1.5 items-center min-h-8">
            {!selectedYear && !selectedWeek && selectedChannels.length === 0 && (
              <span className="text-xs text-muted-foreground">Nenhum filtro aplicado</span>
            )}
            {selectedYear && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                Ano {selectedYear}
              </span>
            )}
            {selectedWeek && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                Semana {selectedWeek}
              </span>
            )}
            {selectedChannels.map(channel => (
              <span key={channel} className="text-xs bg-muted px-2 py-0.5 rounded">
                {channel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
