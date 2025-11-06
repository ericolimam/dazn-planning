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
import { Search, X } from "lucide-react";
import { toast } from "sonner";

interface ProgramFiltersProps {
  genres: string[];
  years: number[];
  series: string[];
  narrators: string[];
  onFilter: (filters: { genre: string; year: string; serie: string; narrator: string }) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function ProgramFilters({ genres, years, series, narrators, onFilter, onClear, isLoading }: ProgramFiltersProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSerie, setSelectedSerie] = useState<string>("all");
  const [selectedNarrator, setSelectedNarrator] = useState<string>("all");

  const handleFilter = () => {
    // Validate that at least one filter is selected
    if (selectedGenre === "all" && selectedYear === "all" && selectedSerie === "all" && selectedNarrator === "all") {
      toast.error("Selecione pelo menos um critério de filtro para realizar a busca");
      return;
    }

    onFilter({
      genre: selectedGenre === "all" ? "" : selectedGenre,
      year: selectedYear === "all" ? "" : selectedYear,
      serie: selectedSerie === "all" ? "" : selectedSerie,
      narrator: selectedNarrator === "all" ? "" : selectedNarrator,
    });
  };

  const handleClear = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
    setSelectedSerie("all");
    setSelectedNarrator("all");
    onClear();
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="genre">Gênero</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre} disabled={isLoading}>
              <SelectTrigger id="genre" className="bg-background">
                <SelectValue placeholder="Todos os gêneros" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Todos os gêneros</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isLoading}>
              <SelectTrigger id="year" className="bg-background">
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

          <div className="space-y-2">
            <Label htmlFor="serie">Série</Label>
            <Select value={selectedSerie} onValueChange={setSelectedSerie} disabled={isLoading}>
              <SelectTrigger id="serie" className="bg-background">
                <SelectValue placeholder="Todas as séries" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[300px]">
                <SelectItem value="all">Todas as séries</SelectItem>
                {series.map((serie) => (
                  <SelectItem key={serie} value={serie}>
                    {serie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="narrator">Narrador</Label>
            <Select value={selectedNarrator} onValueChange={setSelectedNarrator} disabled={isLoading}>
              <SelectTrigger id="narrator" className="bg-background">
                <SelectValue placeholder="Todos os narradores" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[300px]">
                <SelectItem value="all">Todos os narradores</SelectItem>
                {narrators.map((narrator) => (
                  <SelectItem key={narrator} value={narrator}>
                    {narrator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2 md:col-span-2">
            <Button
              onClick={handleFilter}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}