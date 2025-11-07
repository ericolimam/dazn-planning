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
    RESUMO: program?.RESUMO || false,
    DESTAQUE_SEMANA: program?.DESTAQUE_SEMANA || false,
    PROMO_DAZN: program?.PROMO_DAZN || false,
  });

  if (!program) return null;

  const handleEdit = () => {
    const newData = {
      STATE_EVENT_ID: String(program.STATE_EVENT_ID || ''),
      CABINE_ID: String(program.CABINE_ID || ''),
      NARRATOR_ID: String(program.NARRATOR_ID || ''),
      RESUMO: program.RESUMO || false,
      DESTAQUE_SEMANA: program.DESTAQUE_SEMANA || false,
      PROMO_DAZN: program.PROMO_DAZN || false,
    };
    console.log('Editing program:', program.TITLE);
    console.log('Edited data:', newData);
    console.log('Available narrators:', narrators.length);
    console.log('Available cabines:', cabines.length);
    console.log('Available state events:', stateEvents.length);
    setEditedData(newData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      STATE_EVENT_ID: program.STATE_EVENT_ID || '',
      CABINE_ID: program.CABINE_ID || '',
      NARRATOR_ID: program.NARRATOR_ID || '',
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
                    <Label htmlFor="state_event">Estado/Evento</Label>
                    <Select
                      value={editedData.STATE_EVENT_ID}
                      onValueChange={(value) => setEditedData({ ...editedData, STATE_EVENT_ID: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o estado/evento" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="">Nenhum</SelectItem>
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

          {/* Production Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Produção
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cabine">Cabine</Label>
                  <Select
                    value={editedData.CABINE_ID}
                    onValueChange={(value) => setEditedData({ ...editedData, CABINE_ID: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione a cabine" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="">Nenhuma</SelectItem>
                      {cabines.map((cabine) => (
                        <SelectItem key={cabine.id} value={String(cabine.id)}>
                          {cabine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="narrator">Narrador</Label>
                  <Select
                    value={editedData.NARRATOR_ID}
                    onValueChange={(value) => setEditedData({ ...editedData, NARRATOR_ID: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione o narrador" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="">Nenhum</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Cabine" value={program.CABINE} />
                <InfoRow label="Narrador" value={program.NARRATOR} />
              </div>
            )}
          </div>

          <Separator />

          {/* Features & Highlights */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Características
            </h3>
            {isEditing ? (
              <div className="space-y-4">
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
            )}
          </div>
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