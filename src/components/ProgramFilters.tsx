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

interface ProgramFiltersProps {
  genres: string[];
  years: number[];
  onFilter: (filters: { genre: string; year: string }) => void;
  isLoading?: boolean;
}

export function ProgramFilters({ genres, years, onFilter, isLoading }: ProgramFiltersProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const handleFilter = () => {
    onFilter({
      genre: selectedGenre === "all" ? "" : selectedGenre,
      year: selectedYear === "all" ? "" : selectedYear,
    });
  };

  const handleClear = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
    onFilter({ genre: "", year: "" });
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="flex items-end gap-2 md:col-span-2 lg:col-span-2">
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
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}