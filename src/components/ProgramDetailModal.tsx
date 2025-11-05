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
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                    {program.GENRE || '-'}
                  </Badge>
                </InfoRow>
                <InfoRow label="Ano" value={program.YEAR} />
                <InfoRow label="Estado/Evento">
                  <Badge variant="outline" className="bg-secondary/10 border-secondary/20">
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
              <Badge variant={program.RESUMO ? "default" : "outline"} className={program.RESUMO ? "bg-primary" : ""}>
                {program.RESUMO ? '✓' : '✗'} Resumo
              </Badge>
              <Badge variant={program.DESTAQUE_SEMANA ? "default" : "outline"} className={program.DESTAQUE_SEMANA ? "bg-accent" : ""}>
                {program.DESTAQUE_SEMANA ? '✓' : '✗'} Destaque da Semana
              </Badge>
              <Badge variant={program.PROMO_DAZN ? "default" : "outline"} className={program.PROMO_DAZN ? "bg-secondary" : ""}>
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