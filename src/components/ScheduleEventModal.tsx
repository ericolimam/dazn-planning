import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScheduleEvent } from "@/pages/Schedule";
import { Star, Sparkles, TrendingUp } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import { extractTeamNames } from "@/utils/extractTeamNames";

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

const formatTime = (timeStr: string) => {
  // Format: HH:MM:SS or HH:MM
  const parts = timeStr.split(':');
  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  const seconds = parts[2]?.padStart(2, '0') || '00';
  return `${hours}:${minutes}:${seconds}`;
};

const formatDuration = (duration: string) => {
  // Duration format: HH:MM:SS or HH:MM
  const parts = duration.split(':');
  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  const seconds = parts[2]?.padStart(2, '0') || '00';
  return `${hours}:${minutes}:${seconds}`;
};

const getPremiereBadge = (premiere: string | undefined) => {
  if (!premiere) return null;
  
  const premierConfig: Record<string, { icon: JSX.Element; label: string; className: string }> = {
    'ESTREIA': { 
      icon: <Star className="h-4 w-4 mr-1" fill="gold" color="gold" />, 
      label: 'Estreia',
      className: 'bg-yellow-600 text-white border-yellow-600'
    },
    'EXCLUSIVO': { 
      icon: <Sparkles className="h-4 w-4 mr-1" fill="white" color="white" />, 
      label: 'Exclusivo',
      className: 'bg-purple-600 text-white border-purple-600'
    },
    'DESTAQUE': { 
      icon: <TrendingUp className="h-4 w-4 mr-1" color="white" />, 
      label: 'Destaque',
      className: 'bg-blue-600 text-white border-blue-600'
    },
  };
  
  const config = premierConfig[premiere];
  if (!config) return null;
  
  return (
    <Badge variant="secondary" className={config.className}>
      <span className="flex items-center">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
};

interface ScheduleEventModalProps {
  event: ScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleEventModal({ event, open, onOpenChange }: ScheduleEventModalProps) {
  if (!event) return null;

  const programName = event.PROGRAMME || event.SERIES || event.TXSLOT_NAME;
  const teamNames = extractTeamNames(programName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {teamNames && teamNames.length === 2 ? (
              <div className="flex items-center gap-3 flex-wrap">
                {/* First Team */}
                <div className="flex items-center gap-2">
                  {getTeamLogo(teamNames[0], 32) && (
                    <img 
                      src={getTeamLogo(teamNames[0], 32)!} 
                      alt={teamNames[0]} 
                      className="w-8 h-8 bg-white rounded p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{teamNames[0]}</span>
                </div>
                
                {/* VS separator */}
                <span className="text-muted-foreground font-normal">vs</span>
                
                {/* Second Team */}
                <div className="flex items-center gap-2">
                  {getTeamLogo(teamNames[1], 32) && (
                    <img 
                      src={getTeamLogo(teamNames[1], 32)!} 
                      alt={teamNames[1]} 
                      className="w-8 h-8 bg-white rounded p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{teamNames[1]}</span>
                </div>
              </div>
            ) : (
              programName
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {event.SERIES && event.PROGRAMME && `Série: ${event.SERIES}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informações do Evento
              </h3>
              <div className="space-y-2">
                <InfoRow label="ID" value={event.ID} />
                <InfoRow label="Canal" value={event.CHANNEL} />
                <InfoRow label="Semana" value={event.WEEK} />
                <InfoRow label="Data" value={event.DATE} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Horário
              </h3>
              <div className="space-y-2">
                <InfoRow label="Início" value={formatTime(event.START_TIME)} />
                <InfoRow label="Início Faturado" value={formatTime(event.BILLED_START)} />
                <InfoRow label="Duração" value={formatDuration(event.DURATION)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Classification */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Classificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Gênero">
                <Badge variant="secondary" className={getGenreColor(event.GENRE)}>
                  {event.GENRE || '-'}
                </Badge>
              </InfoRow>
              <InfoRow label="Categoria" value={event.PROGCATEGORY} />
              <InfoRow label="Tipo de Programa" value={event.PROG_REQTYPE} />
              <InfoRow label="Tipo de Série" value={event.SERIES_REQTYPE} />
              <InfoRow label="Premiere">
                {event.PREMIERE ? getPremiereBadge(event.PREMIERE) : <span className="text-sm font-semibold">-</span>}
              </InfoRow>
              {event.VERSION === 'Live' && (
                <InfoRow label="Transmissão">
                  <Badge variant="secondary" className="bg-black text-white border-black">
                    DIRETO
                  </Badge>
                </InfoRow>
              )}
            </div>
          </div>

          {event.TXSLOT_NAME && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Identificação do Slot
                </h3>
                <InfoRow label="Nome do Slot" value={event.TXSLOT_NAME} />
              </div>
            </>
          )}
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
