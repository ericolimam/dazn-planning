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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  EPISODE: number;
  X_TXDAY_DATE?: string;
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
  // Planning fields
  COMMTYPE?: string;
  COMMTYPE_ID?: string;
  BT?: string;
  BT_ID?: string;
  PRODADDINFO?: string;
  MATCHHIGH?: string;
  // Promoção fields
  TOPCONTENT_RF?: string;
  TOPCONTENT_RF_ID?: string;
  CLASSICDERBI?: boolean;
  CONTENTDETAIL?: string;
  PLATAFORMBANNERS?: boolean;
  PROMOINDIVIDUAL?: boolean;
  PROMOCONJUNTA?: boolean;
  PROMOGENERICA?: boolean;
  PROMO10S?: boolean;
  DETALHESPROMO?: string;
  TELCOS?: boolean;
  CRM?: boolean;
  SOCIAL?: boolean;
}

interface ProgramTableProps {
  programs: Program[];
  onProgramClick: (program: Program) => void;
  isLoading?: boolean;
  onProgramUpdate?: (updatedProgram: Program) => void;
  stateEvents?: Array<{id: string; name: string}>;
  cabines?: Array<{id: string; name: string}>;
  narrators?: Array<{id: string; name: string}>;
  commtypes?: Array<{id: string; name: string}>;
  bts?: Array<{id: string; name: string}>;
  topcontents?: Array<{id: string; name: string}>;
}

export function ProgramTable({ 
  programs, 
  onProgramClick, 
  isLoading, 
  onProgramUpdate,
  stateEvents = [],
  cabines = [],
  narrators = [],
  commtypes = [],
  bts = [],
  topcontents = []
}: ProgramTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Program | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{programId: number; field: string} | null>(null);
  const [savingCell, setSavingCell] = useState<{programId: number; field: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({});

  const handleSort = (column: keyof Program) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCellUpdate = async (program: Program, field: string, value: any) => {
    setSavingCell({ programId: program.ID, field });
    
    try {
      const updates: any = {};
      updates[field] = value;
      
      const { data, error } = await supabase.functions.invoke('update-program', {
        body: {
          programId: program.ID,
          updates
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Campo atualizado com sucesso!');
        
        // Create updated program object
        const updatedProgram: Program = {
          ...program,
          [field]: value
        };
        
        // Update display name if it's an ID field
        if (field === 'COMMTYPE_ID') {
          updatedProgram.COMMTYPE = commtypes.find(c => c.id === value)?.name || program.COMMTYPE;
        } else if (field === 'BT_ID') {
          updatedProgram.BT = bts.find(b => b.id === value)?.name || program.BT;
        } else if (field === 'TOPCONTENT_RF_ID') {
          updatedProgram.TOPCONTENT_RF = topcontents.find(t => t.id === value)?.name || program.TOPCONTENT_RF;
        }
        
        onProgramUpdate?.(updatedProgram);
        setEditingCell(null);
      } else {
        toast.error(data?.error || 'Erro ao atualizar campo');
      }
    } catch (error: any) {
      console.error('Error updating field:', error);
      toast.error('Erro ao atualizar campo');
    } finally {
      setSavingCell(null);
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

  // Pagination calculations
  const totalPages = Math.ceil(sortedPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrograms = sortedPrograms.slice(startIndex, endIndex);

  // Reset to page 1 when programs change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
              <TableHead onClick={() => handleSort('EPISODE')} className="cursor-pointer hover:bg-muted transition-colors min-w-[80px] h-8 py-1 text-xs">
                Episódio {sortColumn === 'EPISODE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('X_TXDAY_DATE')} className="cursor-pointer hover:bg-muted transition-colors min-w-[100px] h-8 py-1 text-xs">
                Tx. Date {sortColumn === 'X_TXDAY_DATE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('TITLE')} className="cursor-pointer hover:bg-muted transition-colors min-w-[200px] h-8 py-1 text-xs">
                Título {sortColumn === 'TITLE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('SERIE_TITLE')} className="cursor-pointer hover:bg-muted transition-colors min-w-[150px] h-8 py-1 text-xs">
                Série {sortColumn === 'SERIE_TITLE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('GENRE')} className="cursor-pointer hover:bg-muted transition-colors min-w-[120px] h-8 py-1 text-xs">
                Gênero {sortColumn === 'GENRE' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('YEAR')} className="cursor-pointer hover:bg-muted transition-colors min-w-[60px] h-8 py-1 text-xs">
                Ano {sortColumn === 'YEAR' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              {/* Planning Fields */}
              <TableHead className="min-w-[150px] h-8 py-1 text-xs">Tipo Comentário</TableHead>
              <TableHead className="min-w-[100px] h-8 py-1 text-xs">BT</TableHead>
              <TableHead className="min-w-[200px] h-8 py-1 text-xs">Info Adicional</TableHead>
              <TableHead className="min-w-[100px] h-8 py-1 text-xs">Match High</TableHead>
              {/* Promoção Fields */}
              <TableHead className="min-w-[150px] h-8 py-1 text-xs">Top Content</TableHead>
              <TableHead className="min-w-[120px] h-8 py-1 text-xs">Clássico/Dérbi</TableHead>
              <TableHead className="min-w-[200px] h-8 py-1 text-xs">Detalhe Conteúdo</TableHead>
              <TableHead className="min-w-[120px] h-8 py-1 text-xs">Banners Plat.</TableHead>
              <TableHead className="min-w-[120px] h-8 py-1 text-xs">Promo Individual</TableHead>
              <TableHead className="min-w-[120px] h-8 py-1 text-xs">Promo Conjunta</TableHead>
              <TableHead className="min-w-[120px] h-8 py-1 text-xs">Promo Genérica</TableHead>
              <TableHead className="min-w-[100px] h-8 py-1 text-xs">Promo 10s</TableHead>
              <TableHead className="min-w-[200px] h-8 py-1 text-xs">Detalhes Promo</TableHead>
              <TableHead className="min-w-[80px] h-8 py-1 text-xs">Telcos</TableHead>
              <TableHead className="min-w-[80px] h-8 py-1 text-xs">CRM</TableHead>
              <TableHead className="min-w-[80px] h-8 py-1 text-xs">Social</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPrograms.map((program) => {
              const isSaving = (field: string) => 
                savingCell?.programId === program.ID && savingCell?.field === field;
              
              const isEditing = (field: string) => 
                editingCell?.programId === program.ID && editingCell?.field === field;

              const getEditingValue = (field: string, originalValue: any) => {
                const key = `${program.ID}-${field}`;
                return editingValues[key] !== undefined ? editingValues[key] : (originalValue || '');
              };

              const handleInputChange = (field: string, value: string) => {
                const key = `${program.ID}-${field}`;
                setEditingValues(prev => ({ ...prev, [key]: value }));
                setEditingCell({ programId: program.ID, field });
              };

              const handleInputBlur = async (field: string, originalValue: any) => {
                const key = `${program.ID}-${field}`;
                const newValue = editingValues[key];
                
                if (newValue !== undefined && newValue !== originalValue) {
                  await handleCellUpdate(program, field, newValue);
                }
                
                // Clear editing value after save
                setEditingValues(prev => {
                  const newValues = { ...prev };
                  delete newValues[key];
                  return newValues;
                });
              };

              return (
                <TableRow
                  key={program.ID}
                  onDoubleClick={(e) => {
                    // Only trigger if not clicking on an input/select
                    if (!(e.target as HTMLElement).closest('input, select, button')) {
                      onProgramClick(program);
                    }
                  }}
                  className={`transition-colors h-9 ${getRowBackgroundColor(program.STATE_EVENT)}`}
                >
                  <TableCell className="font-medium text-xs py-1">{program.EPISODE || '-'}</TableCell>
                  <TableCell className="text-xs py-1">{program.X_TXDAY_DATE || '-'}</TableCell>
                  <TableCell className="font-semibold text-xs py-1">{program.TITLE || '-'}</TableCell>
                  <TableCell className="text-xs py-1">{program.SERIE_TITLE || '-'}</TableCell>
                  <TableCell className="py-1">
                    <Badge variant="secondary" className={`${getGenreColor(program.GENRE)} text-[10px] py-0 px-1.5`}>
                      {program.GENRE || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-1">{program.YEAR || '-'}</TableCell>
                  
                  {/* Planning Fields */}
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Select
                      value={program.COMMTYPE_ID || ''}
                      onValueChange={(value) => handleCellUpdate(program, 'COMMTYPE_ID', value)}
                      disabled={isSaving('COMMTYPE_ID')}
                    >
                      <SelectTrigger className="h-7 text-[11px]">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {commtypes.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Select
                      value={program.BT_ID || ''}
                      onValueChange={(value) => handleCellUpdate(program, 'BT_ID', value)}
                      disabled={isSaving('BT_ID')}
                    >
                      <SelectTrigger className="h-7 text-[11px]">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {bts.map((bt) => (
                          <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Input
                      value={getEditingValue('PRODADDINFO', program.PRODADDINFO)}
                      onChange={(e) => handleInputChange('PRODADDINFO', e.target.value)}
                      onBlur={() => handleInputBlur('PRODADDINFO', program.PRODADDINFO)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="h-7 text-[11px]"
                      disabled={isSaving('PRODADDINFO')}
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.MATCHHIGH)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'MATCHHIGH', checked)}
                      disabled={isSaving('MATCHHIGH')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  {/* Promoção Fields */}
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Select
                      value={program.TOPCONTENT_RF_ID || ''}
                      onValueChange={(value) => handleCellUpdate(program, 'TOPCONTENT_RF_ID', value)}
                      disabled={isSaving('TOPCONTENT_RF_ID')}
                    >
                      <SelectTrigger className="h-7 text-[11px]">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {topcontents.map((tc) => (
                          <SelectItem key={tc.id} value={tc.id}>{tc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.CLASSICDERBI)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'CLASSICDERBI', checked)}
                      disabled={isSaving('CLASSICDERBI')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Input
                      value={getEditingValue('CONTENTDETAIL', program.CONTENTDETAIL)}
                      onChange={(e) => handleInputChange('CONTENTDETAIL', e.target.value)}
                      onBlur={() => handleInputBlur('CONTENTDETAIL', program.CONTENTDETAIL)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="h-7 text-[11px]"
                      disabled={isSaving('CONTENTDETAIL')}
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.PLATAFORMBANNERS)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'PLATAFORMBANNERS', checked)}
                      disabled={isSaving('PLATAFORMBANNERS')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.PROMOINDIVIDUAL)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'PROMOINDIVIDUAL', checked)}
                      disabled={isSaving('PROMOINDIVIDUAL')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.PROMOCONJUNTA)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'PROMOCONJUNTA', checked)}
                      disabled={isSaving('PROMOCONJUNTA')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.PROMOGENERICA)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'PROMOGENERICA', checked)}
                      disabled={isSaving('PROMOGENERICA')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.PROMO10S)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'PROMO10S', checked)}
                      disabled={isSaving('PROMO10S')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="py-1">
                    <Input
                      value={getEditingValue('DETALHESPROMO', program.DETALHESPROMO)}
                      onChange={(e) => handleInputChange('DETALHESPROMO', e.target.value)}
                      onBlur={() => handleInputBlur('DETALHESPROMO', program.DETALHESPROMO)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="h-7 text-[11px]"
                      disabled={isSaving('DETALHESPROMO')}
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.TELCOS)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'TELCOS', checked)}
                      disabled={isSaving('TELCOS')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.CRM)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'CRM', checked)}
                      disabled={isSaving('CRM')}
                      className="scale-75"
                    />
                  </TableCell>
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center py-1">
                    <Switch
                      checked={Boolean(program.SOCIAL)}
                      onCheckedChange={(checked) => handleCellUpdate(program, 'SOCIAL', checked)}
                      disabled={isSaving('SOCIAL')}
                      className="scale-75"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {sortedPrograms.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Linhas por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page info */}
            <div className="text-sm text-muted-foreground">
              Exibindo {startIndex + 1}-{Math.min(endIndex, sortedPrograms.length)} de {sortedPrograms.length} programas
            </div>

            {/* Pagination */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum as number)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
}