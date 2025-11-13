import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, CalendarIcon, FileDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProgramFiltersProps {
  genres: Array<{id: string; name: string}>;
  years: number[];
  series: string[];
  narrators: Array<{id: string; name: string}>;
  onFilter: (filters: { genre: string; year: string; serie: string; narrator: string; dateFrom: string; dateTo: string }) => void;
  onClear: () => void;
  isLoading?: boolean;
  onExportPDF?: () => void;
  hasPrograms?: boolean;
}

export function ProgramFilters({ genres, years, series, narrators, onFilter, onClear, isLoading, onExportPDF, hasPrograms }: ProgramFiltersProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSerie, setSelectedSerie] = useState<string>("all");
  const [selectedNarrator, setSelectedNarrator] = useState<string>("all");
  const [serieSearchQuery, setSerieSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const filteredSeries = series.filter(serie => {
    const searchTerms = serieSearchQuery.toLowerCase().trim().split(/\s+/);
    const serieLower = serie.toLowerCase();
    return searchTerms.every(term => serieLower.includes(term));
  });

  const handleFilter = () => {
    // Validate that at least one filter is selected
    if (selectedGenre === "all" && selectedYear === "all" && selectedSerie === "all" && selectedNarrator === "all" && !dateFrom && !dateTo) {
      toast.error("Selecione pelo menos um critério de filtro para realizar a busca");
      return;
    }

    // Validate date range
    if (dateFrom && dateTo && dateFrom > dateTo) {
      toast.error("A data inicial deve ser anterior à data final");
      return;
    }

    onFilter({
      genre: selectedGenre === "all" ? "" : selectedGenre,
      year: selectedYear === "all" ? "" : selectedYear,
      serie: selectedSerie === "all" ? "" : selectedSerie,
      narrator: selectedNarrator === "all" ? "" : selectedNarrator,
      dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
      dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : "",
    });
  };

  const handleClear = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
    setSelectedSerie("all");
    setSelectedNarrator("all");
    setSerieSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    onClear();
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="genre" className="text-xs">Gênero</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre} disabled={isLoading}>
              <SelectTrigger id="genre" className="bg-background h-8 text-xs">
                <SelectValue placeholder="Todos os gêneros" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todos os gêneros</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="year" className="text-xs">Ano</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isLoading}>
              <SelectTrigger id="year" className="bg-background h-8 text-xs">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todos os anos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="serie" className="text-xs">Série ({series.length} disponíveis)</Label>
            <Select value={selectedSerie} onValueChange={setSelectedSerie} disabled={isLoading}>
              <SelectTrigger id="serie" className="bg-background h-8 text-xs">
                <SelectValue placeholder="Todas as séries" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[400px]">
                <div className="sticky top-0 bg-background p-2 border-b z-10">
                  <Input
                    placeholder="Buscar série..."
                    value={serieSearchQuery}
                    onChange={(e) => setSerieSearchQuery(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="all">Todas as séries</SelectItem>
                {filteredSeries.length > 0 ? (
                  filteredSeries.map((serie) => (
                    <SelectItem key={serie} value={serie}>
                      {serie}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma série encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="narrator" className="text-xs">Narrador</Label>
            <Select value={selectedNarrator} onValueChange={setSelectedNarrator} disabled={isLoading}>
              <SelectTrigger id="narrator" className="bg-background h-8 text-xs">
                <SelectValue placeholder="Todos os narradores" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[300px]">
                <SelectItem value="all">Todos os narradores</SelectItem>
                {narrators.map((narrator) => (
                  <SelectItem key={narrator.id} value={narrator.name}>
                    {narrator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateFrom" className="text-xs">Tx. Date (De)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateFrom"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background h-8 text-xs",
                    !dateFrom && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateTo" className="text-xs">Tx. Date (Até)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateTo"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background h-8 text-xs",
                    !dateTo && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end gap-2 md:col-span-2">
            <Button
              onClick={handleFilter}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity h-8 text-xs"
            >
              <Search className="mr-1.5 h-3 w-3" />
              Buscar
            </Button>
            {onExportPDF && hasPrograms && (
              <Button
                onClick={onExportPDF}
                variant="secondary"
                disabled={isLoading}
                className="min-w-[120px] h-8 text-xs"
              >
                <FileDown className="mr-1.5 h-3 w-3" />
                Exportar PDF
              </Button>
            )}
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isLoading}
              className="min-w-[80px] h-8 text-xs"
            >
              <X className="mr-1.5 h-3 w-3" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}