import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Program } from "./ProgramTable";
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

interface ProgramDetailModalProps {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: () => void;
  stateEvents?: Array<{id: string; name: string}>;
  cabines?: Array<{id: string; name: string}>;
  narrators?: Array<{id: string; name: string}>;
  commtypes?: Array<{id: string; name: string}>;
  bts?: Array<{id: string; name: string}>;
  topcontents?: Array<{id: string; name: string}>;
}

export function ProgramDetailModal({ 
  program, 
  open, 
  onOpenChange,
  onChange,
  stateEvents = [],
  cabines = [],
  narrators = [],
  commtypes = [],
  bts = [],
  topcontents = []
}: ProgramDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullProgram, setFullProgram] = useState<Program | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [editedData, setEditedData] = useState({
    STATE_EVENT_ID: program?.STATE_EVENT_ID || '',
    CABINE_ID: program?.CABINE_ID || '',
    NARRATOR_ID: program?.NARRATOR_ID || '',
    COMMENTATOR: program?.COMMENTATOR || '',
    TIME_BEFORE: program?.TIME_BEFORE || '',
    TIME_ENDING: program?.TIME_ENDING || '',
    RESUMO: program?.RESUMO || false,
    DESTAQUE_SEMANA: program?.DESTAQUE_SEMANA || false,
    PROMO_DAZN: program?.PROMO_DAZN || false,
    // Planning fields
    COMMTYPE_ID: program?.COMMTYPE_ID || '',
    BT_ID: program?.BT_ID || '',
    PRODADDINFO: program?.PRODADDINFO || '',
    MATCHHIGH: program?.MATCHHIGH || false,
    // Promoção fields
    TOPCONTENT_RF_ID: program?.TOPCONTENT_RF_ID || '',
    CLASSICDERBI: program?.CLASSICDERBI || false,
    CONTENTDETAIL: program?.CONTENTDETAIL || '',
    PLATAFORMBANNERS: program?.PLATAFORMBANNERS || false,
    PROMOINDIVIDUAL: program?.PROMOINDIVIDUAL || false,
    PROMOCONJUNTA: program?.PROMOCONJUNTA || false,
    PROMOGENERICA: program?.PROMOGENERICA || false,
    PROMO10S: program?.PROMO10S || false,
    DETALHESPROMO: program?.DETALHESPROMO || '',
    TELCOS: program?.TELCOS || false,
    CRM: program?.CRM || false,
    SOCIAL: program?.SOCIAL || false,
  });

  useEffect(() => {
    if (program && open) {
      setEditedData({
        STATE_EVENT_ID: program.STATE_EVENT_ID || '',
        CABINE_ID: program.CABINE_ID || '',
        NARRATOR_ID: program.NARRATOR_ID || '',
        COMMENTATOR: program.COMMENTATOR || '',
        TIME_BEFORE: program.TIME_BEFORE || '',
        TIME_ENDING: program.TIME_ENDING || '',
        RESUMO: program.RESUMO || false,
        DESTAQUE_SEMANA: program.DESTAQUE_SEMANA || false,
        PROMO_DAZN: program.PROMO_DAZN || false,
        COMMTYPE_ID: program.COMMTYPE_ID || '',
        BT_ID: program.BT_ID || '',
        PRODADDINFO: program.PRODADDINFO || '',
        MATCHHIGH: Boolean(program.MATCHHIGH),
        TOPCONTENT_RF_ID: program.TOPCONTENT_RF_ID || '',
        CLASSICDERBI: program.CLASSICDERBI || false,
        CONTENTDETAIL: program.CONTENTDETAIL || '',
        PLATAFORMBANNERS: program.PLATAFORMBANNERS || false,
        PROMOINDIVIDUAL: program.PROMOINDIVIDUAL || false,
        PROMOCONJUNTA: program.PROMOCONJUNTA || false,
        PROMOGENERICA: program.PROMOGENERICA || false,
        PROMO10S: program.PROMO10S || false,
        DETALHESPROMO: program.DETALHESPROMO || '',
        TELCOS: program.TELCOS || false,
        CRM: program.CRM || false,
        SOCIAL: program.SOCIAL || false,
      });
      setIsEditing(false);
      setFullProgram(null);
      loadProgramDetails();
    }
  }, [program?.ID, open]);

  const loadProgramDetails = async () => {
    if (!program?.ID) return;
    
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-program-details', {
        body: { programId: program.ID }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setFullProgram(data.data);
      }
    } catch (error: any) {
      console.error('Error loading program details:', error);
      toast.error('Erro ao carregar detalhes do programa');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (!program) return null;
  
  const displayProgram = fullProgram || program;

  const handleEdit = () => {
    // Merge fullProgram and program, preferring non-null values
    const mergedProgram = {
      ...program,
      ...(fullProgram && Object.fromEntries(
        Object.entries(fullProgram).filter(([_, value]) => value !== null && value !== undefined)
      ))
    };
    
    // Find matching IDs by name as fallback
    const findIdByName = (name: string, list: Array<{id: string; name: string}>) => {
      const match = list.find(item => item.name === name);
      return match ? String(match.id) : '';
    };
    
    // Try to use existing IDs, or find by name
    const stateEventId = mergedProgram.STATE_EVENT_ID ? String(mergedProgram.STATE_EVENT_ID) : findIdByName(mergedProgram.STATE_EVENT || '', stateEvents);
    const cabineId = mergedProgram.CABINE_ID ? String(mergedProgram.CABINE_ID) : findIdByName(mergedProgram.CABINE || '', cabines);
    const narratorId = mergedProgram.NARRATOR_ID ? String(mergedProgram.NARRATOR_ID) : findIdByName(mergedProgram.NARRATOR || '', narrators);
    
    const newData = {
      STATE_EVENT_ID: stateEventId,
      CABINE_ID: cabineId,
      NARRATOR_ID: narratorId,
      COMMENTATOR: mergedProgram.COMMENTATOR || '',
      TIME_BEFORE: mergedProgram.TIME_BEFORE || '',
      TIME_ENDING: mergedProgram.TIME_ENDING || '',
      RESUMO: mergedProgram.RESUMO || false,
      DESTAQUE_SEMANA: mergedProgram.DESTAQUE_SEMANA || false,
      PROMO_DAZN: mergedProgram.PROMO_DAZN || false,
      // Planning fields
      COMMTYPE_ID: mergedProgram.COMMTYPE_ID ? String(mergedProgram.COMMTYPE_ID) : findIdByName(mergedProgram.COMMTYPE || '', commtypes),
      BT_ID: mergedProgram.BT_ID ? String(mergedProgram.BT_ID) : findIdByName(mergedProgram.BT || '', bts),
      PRODADDINFO: mergedProgram.PRODADDINFO || '',
      MATCHHIGH: Boolean(mergedProgram.MATCHHIGH),
      // Promoção fields
      TOPCONTENT_RF_ID: mergedProgram.TOPCONTENT_RF_ID ? String(mergedProgram.TOPCONTENT_RF_ID) : findIdByName(mergedProgram.TOPCONTENT_RF || '', topcontents),
      CLASSICDERBI: mergedProgram.CLASSICDERBI || false,
      CONTENTDETAIL: mergedProgram.CONTENTDETAIL || '',
      PLATAFORMBANNERS: mergedProgram.PLATAFORMBANNERS || false,
      PROMOINDIVIDUAL: mergedProgram.PROMOINDIVIDUAL || false,
      PROMOCONJUNTA: mergedProgram.PROMOCONJUNTA || false,
      PROMOGENERICA: mergedProgram.PROMOGENERICA || false,
      PROMO10S: mergedProgram.PROMO10S || false,
      DETALHESPROMO: mergedProgram.DETALHESPROMO || '',
      TELCOS: mergedProgram.TELCOS || false,
      CRM: mergedProgram.CRM || false,
      SOCIAL: mergedProgram.SOCIAL || false,
    };
    
    console.log('=== OPENING EDIT MODE ===');
    console.log('Program:', mergedProgram.TITLE);
    console.log('Current values from merged program:', {
      STATE_EVENT: mergedProgram.STATE_EVENT,
      STATE_EVENT_ID: mergedProgram.STATE_EVENT_ID,
      CABINE: mergedProgram.CABINE,
      CABINE_ID: mergedProgram.CABINE_ID,
      NARRATOR: mergedProgram.NARRATOR,
      NARRATOR_ID: mergedProgram.NARRATOR_ID,
      COMMTYPE: mergedProgram.COMMTYPE,
      COMMTYPE_ID: mergedProgram.COMMTYPE_ID,
      BT: mergedProgram.BT,
      BT_ID: mergedProgram.BT_ID,
      PRODADDINFO: mergedProgram.PRODADDINFO,
      MATCHHIGH: mergedProgram.MATCHHIGH,
    });
    console.log('Matched IDs:', {
      stateEventId,
      cabineId,
      narratorId
    });
    console.log('Setting editedData to:', newData);
    console.log('Available options:', {
      narrators: narrators.map(n => ({ id: n.id, name: n.name })),
      cabines: cabines.map(c => ({ id: c.id, name: c.name })),
      stateEvents: stateEvents.map(s => ({ id: s.id, name: s.name })),
    });
    
    setEditedData(newData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      STATE_EVENT_ID: program.STATE_EVENT_ID || '',
      CABINE_ID: program.CABINE_ID || '',
      NARRATOR_ID: program.NARRATOR_ID || '',
      COMMENTATOR: program.COMMENTATOR || '',
      TIME_BEFORE: program.TIME_BEFORE || '',
      TIME_ENDING: program.TIME_ENDING || '',
      RESUMO: program.RESUMO || false,
      DESTAQUE_SEMANA: program.DESTAQUE_SEMANA || false,
      PROMO_DAZN: program.PROMO_DAZN || false,
      // Planning fields
      COMMTYPE_ID: program.COMMTYPE_ID || '',
      BT_ID: program.BT_ID || '',
      PRODADDINFO: program.PRODADDINFO || '',
      MATCHHIGH: program.MATCHHIGH || '',
      // Promoção fields
      TOPCONTENT_RF_ID: program.TOPCONTENT_RF_ID || '',
      CLASSICDERBI: program.CLASSICDERBI || false,
      CONTENTDETAIL: program.CONTENTDETAIL || '',
      PLATAFORMBANNERS: program.PLATAFORMBANNERS || false,
      PROMOINDIVIDUAL: program.PROMOINDIVIDUAL || false,
      PROMOCONJUNTA: program.PROMOCONJUNTA || false,
      PROMOGENERICA: program.PROMOGENERICA || false,
      PROMO10S: program.PROMO10S || false,
      DETALHESPROMO: program.DETALHESPROMO || '',
      TELCOS: program.TELCOS || false,
      CRM: program.CRM || false,
      SOCIAL: program.SOCIAL || false,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log('=== SAVING PROGRAM ===');
    console.log('Program ID:', program.ID);
    console.log('Updates:', {
      STATE_EVENT: editedData.STATE_EVENT_ID,
      CABINE: editedData.CABINE_ID,
      NARRATOR: editedData.NARRATOR_ID,
      COMMENTATOR: editedData.COMMENTATOR,
      TIME_BEFORE: editedData.TIME_BEFORE,
      TIME_ENDING: editedData.TIME_ENDING,
      RESUMO: editedData.RESUMO,
      DESTAQUE_SEMANA: editedData.DESTAQUE_SEMANA,
      PROMO_DAZN: editedData.PROMO_DAZN
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('update-program', {
        body: {
          programId: program.ID,
          updates: {
            STATE_EVENT: editedData.STATE_EVENT_ID,
            CABINE: editedData.CABINE_ID,
            NARRATOR: editedData.NARRATOR_ID,
            COMMENTATOR: editedData.COMMENTATOR,
            TIME_BEFORE: editedData.TIME_BEFORE,
            TIME_ENDING: editedData.TIME_ENDING,
            RESUMO: editedData.RESUMO,
            DESTAQUE_SEMANA: editedData.DESTAQUE_SEMANA,
            PROMO_DAZN: editedData.PROMO_DAZN,
            // Planning fields
            COMMTYPE: editedData.COMMTYPE_ID,
            BT: editedData.BT_ID,
            PRODADDINFO: editedData.PRODADDINFO,
            MATCHHIGH: editedData.MATCHHIGH,
            // Promoção fields
            TOPCONTENT_RF: editedData.TOPCONTENT_RF_ID,
            CLASSICDERBI: editedData.CLASSICDERBI,
            CONTENTDETAIL: editedData.CONTENTDETAIL,
            PLATAFORMBANNERS: editedData.PLATAFORMBANNERS,
            PROMOINDIVIDUAL: editedData.PROMOINDIVIDUAL,
            PROMOCONJUNTA: editedData.PROMOCONJUNTA,
            PROMOGENERICA: editedData.PROMOGENERICA,
            PROMO10S: editedData.PROMO10S,
            DETALHESPROMO: editedData.DETALHESPROMO,
            TELCOS: editedData.TELCOS,
            CRM: editedData.CRM,
            SOCIAL: editedData.SOCIAL
          }
        }
      });

      console.log('=== SAVE RESPONSE ===');
      console.log('Error:', error);
      console.log('Data:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        toast.success('Programa atualizado com sucesso!');
        setIsEditing(false);
        onOpenChange(false);
      } else {
        console.error('API returned error:', data?.error);
        throw new Error(data?.error || 'Erro ao atualizar programa');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error(`Erro ao atualizar programa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {displayProgram.TITLE}
          </DialogTitle>
          <DialogDescription className="text-base">
            {displayProgram.SERIE_TITLE && `Série: ${displayProgram.SERIE_TITLE}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetails && (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <span className="ml-3 text-muted-foreground">Carregando detalhes...</span>
          </div>
        )}

        <div className="space-y-6 mt-4">{!isLoadingDetails && (
          <>
           {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>
               <div className="space-y-2">
                <InfoRow label="ID" value={displayProgram.ID} />
                <InfoRow label="Episódio" value={displayProgram.EPISODE} />
                <InfoRow label="Tx. Date" value={displayProgram.X_TXDAY_DATE} />
                <InfoRow label="Gênero">
                  <Badge variant="secondary" className={getGenreColor(displayProgram.GENRE)}>
                    {displayProgram.GENRE || '-'}
                  </Badge>
                </InfoRow>
                <InfoRow label="Ano" value={displayProgram.YEAR} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Classificação
              </h3>
              <div className="space-y-2">
                <InfoRow label="Tipo de Programa" value={displayProgram.PROG_TYPE} />
                <InfoRow label="Categoria" value={displayProgram.PROG_CATEGORY} />
                <InfoRow label="Tipo de Requisição" value={displayProgram.REQ_TYPE} />
                <InfoRow label="Tipo de Aquisição" value={displayProgram.ACQ_TYPE} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs for Production, Planning, and Promotion */}
          <Tabs defaultValue="producao" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="producao">Produção</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="promocao">Promoção</TabsTrigger>
            </TabsList>

            {/* Produção Tab */}
            <TabsContent value="producao" className="space-y-4 mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Cabine */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cabine">Cabine</Label>
                      {editedData.CABINE_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, CABINE_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.CABINE && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.CABINE}
                      </p>
                    )}
                    <Select
                      value={editedData.CABINE_ID || undefined}
                      onValueChange={(value) => {
                        console.log('Cabine changed to:', value);
                        console.log('Available cabines:', cabines);
                        setEditedData({ ...editedData, CABINE_ID: value });
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione a cabine" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {cabines.map((cabine) => (
                          <SelectItem key={cabine.id} value={String(cabine.id)}>
                            {cabine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Switches */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="resumo" className="cursor-pointer">Resumo</Label>
                    <Switch
                      id="resumo"
                      checked={editedData.RESUMO}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, RESUMO: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="destaque" className="cursor-pointer">Destaque da Semana</Label>
                    <Switch
                      id="destaque"
                      checked={editedData.DESTAQUE_SEMANA}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, DESTAQUE_SEMANA: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promo" className="cursor-pointer">Promo DAZN</Label>
                    <Switch
                      id="promo"
                      checked={editedData.PROMO_DAZN}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PROMO_DAZN: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow label="Cabine" value={program.CABINE} />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={program.RESUMO ? "default" : "outline"}>
                      {program.RESUMO ? '✓' : '✗'} Resumo
                    </Badge>
                    <Badge variant={program.DESTAQUE_SEMANA ? "default" : "outline"}>
                      {program.DESTAQUE_SEMANA ? '✓' : '✗'} Destaque da Semana
                    </Badge>
                    <Badge variant={program.PROMO_DAZN ? "default" : "outline"}>
                      {program.PROMO_DAZN ? '✓' : '✗'} Promo DAZN
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Planning Tab */}
            <TabsContent value="planning" className="space-y-4 mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Time Before e Time Ending - lado a lado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time_before">Time Before</Label>
                      <Input
                        id="time_before"
                        value={editedData.TIME_BEFORE}
                        onChange={(e) => setEditedData({ ...editedData, TIME_BEFORE: e.target.value })}
                        placeholder="HH:MM"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time_ending">Time Ending</Label>
                      <Input
                        id="time_ending"
                        value={editedData.TIME_ENDING}
                        onChange={(e) => setEditedData({ ...editedData, TIME_ENDING: e.target.value })}
                        placeholder="HH:MM"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Broadcast Type */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="state_event">Broadcast Type</Label>
                      {editedData.STATE_EVENT_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, STATE_EVENT_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.STATE_EVENT && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.STATE_EVENT}
                      </p>
                    )}
                    <Select
                      value={editedData.STATE_EVENT_ID || undefined}
                      onValueChange={(value) => {
                        console.log('State Event changed to:', value);
                        console.log('Available state events:', stateEvents);
                        setEditedData({ ...editedData, STATE_EVENT_ID: value });
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o broadcast type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {stateEvents.map((event) => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Narrador */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="narrator">Narrador</Label>
                      {editedData.NARRATOR_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, NARRATOR_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.NARRATOR && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.NARRATOR}
                      </p>
                    )}
                    <Select
                      value={editedData.NARRATOR_ID || undefined}
                      onValueChange={(value) => {
                        console.log('Narrator changed to:', value);
                        console.log('Available narrators:', narrators);
                        setEditedData({ ...editedData, NARRATOR_ID: value });
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o narrador" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {narrators.map((narrator) => (
                          <SelectItem key={narrator.id} value={String(narrator.id)}>
                            {narrator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comentador(es) */}
                  <div className="space-y-2">
                    <Label htmlFor="commentator">Comentador(es)</Label>
                    <Input
                      id="commentator"
                      value={editedData.COMMENTATOR}
                      onChange={(e) => setEditedData({ ...editedData, COMMENTATOR: e.target.value })}
                      placeholder="Digite o(s) nome(s) do(s) comentador(es)"
                      className="bg-background"
                    />
                  </div>

                  {/* Commercial Type */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="commtype">Commercial Type</Label>
                      {editedData.COMMTYPE_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, COMMTYPE_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.COMMTYPE && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.COMMTYPE}
                      </p>
                    )}
                    <Select
                      value={editedData.COMMTYPE_ID || undefined}
                      onValueChange={(value) => setEditedData({ ...editedData, COMMTYPE_ID: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o commercial type" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {commtypes.map((commtype) => (
                          <SelectItem key={commtype.id} value={String(commtype.id)}>
                            {commtype.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* BT */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bt">BT</Label>
                      {editedData.BT_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, BT_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.BT && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.BT}
                      </p>
                    )}
                    <Select
                      value={editedData.BT_ID || undefined}
                      onValueChange={(value) => setEditedData({ ...editedData, BT_ID: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o BT" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {bts.map((bt) => (
                          <SelectItem key={bt.id} value={String(bt.id)}>
                            {bt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Production Additional Info */}
                  <div className="space-y-2">
                    <Label htmlFor="prodaddinfo">Production Additional Info</Label>
                    <Input
                      id="prodaddinfo"
                      value={editedData.PRODADDINFO}
                      onChange={(e) => setEditedData({ ...editedData, PRODADDINFO: e.target.value })}
                      placeholder="Production additional info"
                      className="bg-background"
                    />
                  </div>

                   {/* Match Highlight */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="matchhigh" className="cursor-pointer">Match Highlight</Label>
                    <Switch
                      id="matchhigh"
                      checked={Boolean(editedData.MATCHHIGH)}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, MATCHHIGH: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Time Before" value={program.TIME_BEFORE} />
                    <InfoRow label="Time Ending" value={program.TIME_ENDING} />
                  </div>
                  <InfoRow label="Broadcast Type">
                    <Badge variant="outline" className="bg-muted border-border">
                      {program.STATE_EVENT || '-'}
                    </Badge>
                  </InfoRow>
                  <InfoRow label="Narrador" value={program.NARRATOR} />
                  <InfoRow label="Comentador(es)" value={program.COMMENTATOR} />
                  <InfoRow label="Commercial Type" value={program.COMMTYPE} />
                  <InfoRow label="BT" value={program.BT} />
                  <InfoRow label="Production Additional Info" value={program.PRODADDINFO} />
                  <InfoRow label="Match Highlight">
                    <Badge variant={program.MATCHHIGH ? "default" : "outline"}>
                      {program.MATCHHIGH ? '✓' : '✗'} Match Highlight
                    </Badge>
                  </InfoRow>
                </div>
              )}
            </TabsContent>

            {/* Promoção Tab */}
            <TabsContent value="promocao" className="space-y-4 mt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Top Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topcontent">Top Content</Label>
                      {editedData.TOPCONTENT_RF_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, TOPCONTENT_RF_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.TOPCONTENT_RF && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.TOPCONTENT_RF}
                      </p>
                    )}
                    <Select
                      value={editedData.TOPCONTENT_RF_ID || undefined}
                      onValueChange={(value) => setEditedData({ ...editedData, TOPCONTENT_RF_ID: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o top content" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {topcontents.map((topcontent) => (
                          <SelectItem key={topcontent.id} value={String(topcontent.id)}>
                            {topcontent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Classic/Derbi */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="classicderbi" className="cursor-pointer">Classic/Derbi</Label>
                    <Switch
                      id="classicderbi"
                      checked={editedData.CLASSICDERBI}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, CLASSICDERBI: checked })}
                    />
                  </div>

                  {/* Content Detail */}
                  <div className="space-y-2">
                    <Label htmlFor="contentdetail">Content Detail</Label>
                    <Input
                      id="contentdetail"
                      value={editedData.CONTENTDETAIL}
                      onChange={(e) => setEditedData({ ...editedData, CONTENTDETAIL: e.target.value })}
                      placeholder="Content detail"
                      className="bg-background"
                    />
                  </div>

                  {/* Platform Banners */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="plataformbanners" className="cursor-pointer">Platform Banners</Label>
                    <Switch
                      id="plataformbanners"
                      checked={editedData.PLATAFORMBANNERS}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PLATAFORMBANNERS: checked })}
                    />
                  </div>

                  {/* Promo Individual */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promoindividual" className="cursor-pointer">Promo Individual</Label>
                    <Switch
                      id="promoindividual"
                      checked={editedData.PROMOINDIVIDUAL}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PROMOINDIVIDUAL: checked })}
                    />
                  </div>

                  {/* Promo Conjunta */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promoconjunta" className="cursor-pointer">Promo Conjunta</Label>
                    <Switch
                      id="promoconjunta"
                      checked={editedData.PROMOCONJUNTA}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PROMOCONJUNTA: checked })}
                    />
                  </div>

                  {/* Promo Genérica */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promogenerica" className="cursor-pointer">Promo Genérica</Label>
                    <Switch
                      id="promogenerica"
                      checked={editedData.PROMOGENERICA}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PROMOGENERICA: checked })}
                    />
                  </div>

                  {/* Promo 10 Segundos */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promo10s" className="cursor-pointer">Promo 10 Segundos</Label>
                    <Switch
                      id="promo10s"
                      checked={editedData.PROMO10S}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, PROMO10S: checked })}
                    />
                  </div>

                  {/* Detalhes Promo */}
                  <div className="space-y-2">
                    <Label htmlFor="detalhespromo">Detalhes Promo</Label>
                    <Input
                      id="detalhespromo"
                      value={editedData.DETALHESPROMO}
                      onChange={(e) => setEditedData({ ...editedData, DETALHESPROMO: e.target.value })}
                      placeholder="Detalhes da promoção"
                      className="bg-background"
                    />
                  </div>

                  {/* Telcos */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telcos" className="cursor-pointer">Telcos</Label>
                    <Switch
                      id="telcos"
                      checked={editedData.TELCOS}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, TELCOS: checked })}
                    />
                  </div>

                  {/* CRM */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crm" className="cursor-pointer">CRM</Label>
                    <Switch
                      id="crm"
                      checked={editedData.CRM}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, CRM: checked })}
                    />
                  </div>

                  {/* Social */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="social" className="cursor-pointer">Social</Label>
                    <Switch
                      id="social"
                      checked={editedData.SOCIAL}
                      onCheckedChange={(checked) => setEditedData({ ...editedData, SOCIAL: checked })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow label="Top Content" value={program.TOPCONTENT_RF} />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={program.CLASSICDERBI ? "default" : "outline"}>
                      {program.CLASSICDERBI ? '✓' : '✗'} Classic/Derbi
                    </Badge>
                    <Badge variant={program.PLATAFORMBANNERS ? "default" : "outline"}>
                      {program.PLATAFORMBANNERS ? '✓' : '✗'} Platform Banners
                    </Badge>
                    <Badge variant={program.PROMOINDIVIDUAL ? "default" : "outline"}>
                      {program.PROMOINDIVIDUAL ? '✓' : '✗'} Promo Individual
                    </Badge>
                    <Badge variant={program.PROMOCONJUNTA ? "default" : "outline"}>
                      {program.PROMOCONJUNTA ? '✓' : '✗'} Promo Conjunta
                    </Badge>
                    <Badge variant={program.PROMOGENERICA ? "default" : "outline"}>
                      {program.PROMOGENERICA ? '✓' : '✗'} Promo Genérica
                    </Badge>
                    <Badge variant={program.PROMO10S ? "default" : "outline"}>
                      {program.PROMO10S ? '✓' : '✗'} Promo 10s
                    </Badge>
                    <Badge variant={program.TELCOS ? "default" : "outline"}>
                      {program.TELCOS ? '✓' : '✗'} Telcos
                    </Badge>
                    <Badge variant={program.CRM ? "default" : "outline"}>
                      {program.CRM ? '✓' : '✗'} CRM
                    </Badge>
                    <Badge variant={program.SOCIAL ? "default" : "outline"}>
                      {program.SOCIAL ? '✓' : '✗'} Social
                    </Badge>
                  </div>
                  <InfoRow label="Content Detail" value={program.CONTENTDETAIL} />
                  <InfoRow label="Detalhes Promo" value={program.DETALHESPROMO} />
                </div>
              )}
        </TabsContent>
        </Tabs>
        </>
        )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: any; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      {children ? (
        <div>{children}</div>
      ) : (
        <span className="text-sm font-semibold">{value || '-'}</span>
      )}
    </div>
  );
}