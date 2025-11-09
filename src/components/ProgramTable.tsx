import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getGenreColor = (genre: string) => {
  const colors: Record<string, string> = {
    'FUTEBOL': 'bg-slate-700 text-white border-slate-700',
    'BASQUETEBOL': 'bg-zinc-700 text-white border-zinc-700',
    'ATLETISMO': 'bg-gray-700 text-white border-gray-700',
    'BOXE': 'bg-neutral-700 text-white border-neutral-700',
    'PROGRAMAS': 'bg-stone-700 text-white border-stone-700',
    'MMA': 'bg-slate-600 text-white border-slate-600',
    'TÉNIS': 'bg-zinc-600 text-white border-zinc-600',
    'DARDOS': 'bg-gray-600 text-white border-gray-600',
    'HÓQUEI': 'bg-neutral-600 text-white border-neutral-600',
    'RÂGUEBI': 'bg-stone-600 text-white border-stone-600',
    'ANDEBOL': 'bg-slate-800 text-white border-slate-800',
    'TÉNIS DE MESA': 'bg-zinc-800 text-white border-zinc-800',
    'VOLEIBOL': 'bg-gray-800 text-white border-gray-800',
    'CICLISMO': 'bg-neutral-800 text-white border-neutral-800',
    'AUTOMOBILISMO': 'bg-stone-800 text-white border-stone-800',
  };
  
  return colors[genre] || 'bg-muted text-foreground border-border';
};

const getRowBackgroundColor = (stateEvent: string) => {
  const normalizedState = stateEvent?.toUpperCase().trim() || '';
  
  // Accept both "LIVE+EVENTO" and "LIVE + EVENTO"
  if (normalizedState === 'LIVE+EVENTO' || normalizedState === 'LIVE + EVENTO') {
    return 'bg-state-yellow-pastel hover:bg-state-yellow-pastel-hover transition-colors';
  }
  if (normalizedState === 'EN FEED') {
    return 'bg-state-red-pastel hover:bg-state-red-pastel-hover transition-colors';
  }
  if (normalizedState === 'FLY') {
    return 'bg-state-blue-pastel hover:bg-state-blue-pastel-hover transition-colors';
  }
  
  return 'hover:bg-muted/50 transition-colors';
};

export interface Program {
  ID: number;
  TITLE: string;
  SERIE_TITLE: string;
  GENRE: string;
  PROG_TYPE: string;
  REQ_TYPE: string;
  PROG_CATEGORY: string;
  ACQ_TYPE: string;
  CABINE: string;
  CABINE_ID: string;
  NARRATOR: string;
  NARRATOR_ID: string;
  COMMENTATOR: string;
  TIME_BEFORE?: string;
  TIME_ENDING?: string;
  RESUMO: boolean;
  DESTAQUE_SEMANA: boolean;
  PROMO_DAZN: boolean;
  YEAR: number;
  STATE_EVENT: string;
  STATE_EVENT_ID: string;
}

interface ProgramTableProps {
  programs: Program[];
  onProgramClick: (program: Program) => void;
  isLoading?: boolean;
}

export function ProgramTable({ programs, onProgramClick, isLoading }: ProgramTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Program | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof Program) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedPrograms = [...programs].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  if (isLoading) {
    return (
      <Card className="shadow-[var(--shadow-card)]">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando programas...</p>
        </div>
      </Card>
    );
  }

  if (programs.length === 0) {
    return (
      <Card className="shadow-[var(--shadow-card)]">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum programa encontrado.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead onClick={() => handleSort('ID')} className="cursor-pointer hover:bg-muted transition-colors">
                ID {sortColumn === 'ID' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('TITLE')} className="cursor-pointer hover:bg-muted transition-colors">
                Título {sortColumn === 'TITLE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('SERIE_TITLE')} className="cursor-pointer hover:bg-muted transition-colors">
                Título da Série {sortColumn === 'SERIE_TITLE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('GENRE')} className="cursor-pointer hover:bg-muted transition-colors">
                Gênero {sortColumn === 'GENRE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('YEAR')} className="cursor-pointer hover:bg-muted transition-colors">
                Ano {sortColumn === 'YEAR' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Tipo Prog.</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPrograms.map((program) => (
              <TableRow
                key={program.ID}
                onDoubleClick={() => onProgramClick(program)}
                className={`cursor-pointer transition-colors ${getRowBackgroundColor(program.STATE_EVENT)}`}
              >
                <TableCell className="font-medium">{program.ID}</TableCell>
                <TableCell className="font-semibold">{program.TITLE || '-'}</TableCell>
                <TableCell>{program.SERIE_TITLE || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getGenreColor(program.GENRE)}>
                    {program.GENRE || '-'}
                  </Badge>
                </TableCell>
                <TableCell>{program.YEAR || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{program.PROG_TYPE || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{program.PROG_CATEGORY || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {program.RESUMO && <Badge variant="outline" className="text-xs">Resumo</Badge>}
                    {program.DESTAQUE_SEMANA && <Badge variant="outline" className="text-xs">Destaque</Badge>}
                    {program.PROMO_DAZN && <Badge variant="outline" className="text-xs">DAZN</Badge>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}