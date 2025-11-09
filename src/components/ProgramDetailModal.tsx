import { useState } from "react";
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
  stateEvents?: Array<{id: string; name: string}>;
  cabines?: Array<{id: string; name: string}>;
  narrators?: Array<{id: string; name: string}>;
}

export function ProgramDetailModal({ 
  program, 
  open, 
  onOpenChange,
  stateEvents = [],
  cabines = [],
  narrators = []
}: ProgramDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    STATE_EVENT_ID: program?.STATE_EVENT_ID || '',
    CABINE_ID: program?.CABINE_ID || '',
    NARRATOR_ID: program?.NARRATOR_ID || '',
    COMMENTATOR_ID: program?.COMMENTATOR_ID || '',
    RESUMO: program?.RESUMO || false,
    DESTAQUE_SEMANA: program?.DESTAQUE_SEMANA || false,
    PROMO_DAZN: program?.PROMO_DAZN || false,
  });

  if (!program) return null;

  const handleEdit = () => {
    // Find matching IDs by name as fallback
    const findIdByName = (name: string, list: Array<{id: string; name: string}>) => {
      const match = list.find(item => item.name === name);
      return match ? String(match.id) : '';
    };
    
    // Try to use existing IDs, or find by name
    const stateEventId = program.STATE_EVENT_ID ? String(program.STATE_EVENT_ID) : findIdByName(program.STATE_EVENT || '', stateEvents);
    const cabineId = program.CABINE_ID ? String(program.CABINE_ID) : findIdByName(program.CABINE || '', cabines);
    const narratorId = program.NARRATOR_ID ? String(program.NARRATOR_ID) : findIdByName(program.NARRATOR || '', narrators);
    const commentatorId = program.COMMENTATOR_ID ? String(program.COMMENTATOR_ID) : findIdByName(program.COMMENTATOR || '', narrators);
    
    const newData = {
      STATE_EVENT_ID: stateEventId,
      CABINE_ID: cabineId,
      NARRATOR_ID: narratorId,
      COMMENTATOR_ID: commentatorId,
      RESUMO: program.RESUMO || false,
      DESTAQUE_SEMANA: program.DESTAQUE_SEMANA || false,
      PROMO_DAZN: program.PROMO_DAZN || false,
    };
    
    console.log('=== OPENING EDIT MODE ===');
    console.log('Program:', program.TITLE);
    console.log('Current values from program:', {
      STATE_EVENT: program.STATE_EVENT,
      STATE_EVENT_ID: program.STATE_EVENT_ID,
      CABINE: program.CABINE,
      CABINE_ID: program.CABINE_ID,
      NARRATOR: program.NARRATOR,
      NARRATOR_ID: program.NARRATOR_ID,
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
      COMMENTATOR_ID: program.COMMENTATOR_ID || '',
      RESUMO: program.RESUMO || false,
      DESTAQUE_SEMANA: program.DESTAQUE_SEMANA || false,
      PROMO_DAZN: program.PROMO_DAZN || false,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-program', {
        body: {
          programId: program.ID,
          updates: {
            STATE_EVENT: editedData.STATE_EVENT_ID,
            CABINE: editedData.CABINE_ID,
            NARRATOR: editedData.NARRATOR_ID,
            COMMENTATOR: editedData.COMMENTATOR_ID,
            RESUMO: editedData.RESUMO,
            DESTAQUE_SEMANA: editedData.DESTAQUE_SEMANA,
            PROMO_DAZN: editedData.PROMO_DAZN
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Programa atualizado com sucesso!');
        setIsEditing(false);
        onOpenChange(false);
        // Reload the page to fetch updated data
        window.location.reload();
      } else {
        throw new Error(data?.error || 'Erro ao atualizar programa');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error('Erro ao atualizar programa. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {program.TITLE}
          </DialogTitle>
          <DialogDescription className="text-base">
            {program.SERIE_TITLE && `Série: ${program.SERIE_TITLE}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>
              <div className="space-y-2">
                <InfoRow label="ID" value={program.ID} />
                <InfoRow label="Gênero">
                  <Badge variant="secondary" className={getGenreColor(program.GENRE)}>
                    {program.GENRE || '-'}
                  </Badge>
                </InfoRow>
                <InfoRow label="Ano" value={program.YEAR} />
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="state_event">Estado/Evento</Label>
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
                        <SelectValue placeholder="Selecione o estado/evento" />
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
                ) : (
                  <InfoRow label="Estado/Evento">
                    <Badge variant="outline" className="bg-muted border-border">
                      {program.STATE_EVENT || '-'}
                    </Badge>
                  </InfoRow>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Classificação
              </h3>
              <div className="space-y-2">
                <InfoRow label="Tipo de Programa" value={program.PROG_TYPE} />
                <InfoRow label="Categoria" value={program.PROG_CATEGORY} />
                <InfoRow label="Tipo de Requisição" value={program.REQ_TYPE} />
                <InfoRow label="Tipo de Aquisição" value={program.ACQ_TYPE} />
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="commentator">Comentador(es)</Label>
                      {editedData.COMMENTATOR_ID && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditedData({ ...editedData, COMMENTATOR_ID: '' })}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {program.COMMENTATOR && (
                      <p className="text-xs text-muted-foreground">
                        Valor atual: {program.COMMENTATOR}
                      </p>
                    )}
                    <Select
                      value={editedData.COMMENTATOR_ID || undefined}
                      onValueChange={(value) => {
                        console.log('Commentator changed to:', value);
                        console.log('Available narrators:', narrators);
                        setEditedData({ ...editedData, COMMENTATOR_ID: value });
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o comentador" />
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
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow label="Narrador" value={program.NARRATOR} />
                  <InfoRow label="Comentador(es)" value={program.COMMENTATOR} />
                </div>
              )}
            </TabsContent>

            {/* Promoção Tab */}
            <TabsContent value="promocao" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                Em breve...
              </p>
            </TabsContent>
          </Tabs>
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