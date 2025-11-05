import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Program } from "./ProgramTable";

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
}

export function ProgramDetailModal({ program, open, onOpenChange }: ProgramDetailModalProps) {
  if (!program) return null;

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
                <InfoRow label="Estado/Evento">
                  <Badge variant="outline" className="bg-muted border-border">
                    {program.STATE_EVENT || '-'}
                  </Badge>
                </InfoRow>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Cabine" value={program.CABINE} />
              <InfoRow label="Narrador" value={program.NARRATOR} />
            </div>
          </div>

          <Separator />

          {/* Features & Highlights */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Características
            </h3>
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
        </div>
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