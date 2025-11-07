import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navigation
    'nav.programs': 'Programas',
    'nav.schedule': 'Grade de Programação',
    'nav.timeline': 'Timeline',
    
    // Catalog
    'catalog.title': 'Catálogo de Programas',
    'catalog.subtitle': 'Gestão completa de programas e séries',
    'catalog.searchPlaceholder': 'Pesquisar programas...',
    'catalog.filterByGenre': 'Filtrar por Gênero',
    'catalog.filterByYear': 'Filtrar por Ano',
    'catalog.allGenres': 'Todos os Gêneros',
    'catalog.allYears': 'Todos os Anos',
    'catalog.loading': 'Carregando programas...',
    'catalog.noPrograms': 'Nenhum programa encontrado.',
    
    // Program Details
    'program.basicInfo': 'Informações Básicas',
    'program.classification': 'Classificação',
    'program.production': 'Produção',
    'program.characteristics': 'Características',
    'program.id': 'ID',
    'program.genre': 'Gênero',
    'program.year': 'Ano',
    'program.stateEvent': 'Estado/Evento',
    'program.type': 'Tipo de Programa',
    'program.category': 'Categoria',
    'program.reqType': 'Tipo de Requisição',
    'program.acqType': 'Tipo de Aquisição',
    'program.cabine': 'Cabine',
    'program.narrator': 'Narrador',
    'program.resume': 'Resumo',
    'program.highlight': 'Destaque da Semana',
    'program.promo': 'Promo DAZN',
    'program.edit': 'Editar',
    'program.save': 'Salvar',
    'program.saving': 'Salvando...',
    'program.cancel': 'Cancelar',
    'program.clear': 'Limpar',
    'program.currentValue': 'Valor atual',
    'program.selectPlaceholder': 'Selecione',
    
    // Schedule
    'schedule.title': 'Grade de Programação',
    'schedule.subtitle': 'Visualização e gestão da programação em calendário',
    'schedule.filterByWeek': 'Filtrar por Semana',
    'schedule.filterByChannel': 'Filtrar por Canal',
    'schedule.filterByYear': 'Filtrar por Ano',
    'schedule.allWeeks': 'Todas as Semanas',
    'schedule.allChannels': 'Todos os Canais',
    'schedule.allYears': 'Todos os Anos',
    'schedule.loading': 'Carregando programação...',
    'schedule.noEvents': 'Nenhum evento encontrado.',
    
    // Timeline
    'timeline.title': 'Timeline de Programação',
    'timeline.subtitle': 'Visualização em linha do tempo da programação por canal',
    'timeline.selectDate': 'Selecionar Data',
    'timeline.noEvents': 'Nenhum evento encontrado',
    'timeline.forSelectedWeek': 'para a semana selecionada',
    'timeline.forSelectedDate': 'para a data selecionada',
    'timeline.channel': 'Canal',
    
    // User Menu
    'user.settings': 'Configurações',
    'user.theme': 'Tema',
    'user.language': 'Idioma',
    'user.light': 'Claro',
    'user.dark': 'Escuro',
    'user.system': 'Sistema',
    'user.logout': 'Sair',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.signup': 'Registrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.fullName': 'Nome Completo',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    
    // Messages
    'message.updateSuccess': 'Programa atualizado com sucesso!',
    'message.updateError': 'Erro ao atualizar programa. Tente novamente.',
    'message.loadError': 'Erro ao carregar dados',
  },
  en: {
    // Navigation
    'nav.programs': 'Programs',
    'nav.schedule': 'Programming Schedule',
    'nav.timeline': 'Timeline',
    
    // Catalog
    'catalog.title': 'Program Catalog',
    'catalog.subtitle': 'Complete management of programs and series',
    'catalog.searchPlaceholder': 'Search programs...',
    'catalog.filterByGenre': 'Filter by Genre',
    'catalog.filterByYear': 'Filter by Year',
    'catalog.allGenres': 'All Genres',
    'catalog.allYears': 'All Years',
    'catalog.loading': 'Loading programs...',
    'catalog.noPrograms': 'No programs found.',
    
    // Program Details
    'program.basicInfo': 'Basic Information',
    'program.classification': 'Classification',
    'program.production': 'Production',
    'program.characteristics': 'Characteristics',
    'program.id': 'ID',
    'program.genre': 'Genre',
    'program.year': 'Year',
    'program.stateEvent': 'State/Event',
    'program.type': 'Program Type',
    'program.category': 'Category',
    'program.reqType': 'Request Type',
    'program.acqType': 'Acquisition Type',
    'program.cabine': 'Cabin',
    'program.narrator': 'Narrator',
    'program.resume': 'Summary',
    'program.highlight': 'Week Highlight',
    'program.promo': 'DAZN Promo',
    'program.edit': 'Edit',
    'program.save': 'Save',
    'program.saving': 'Saving...',
    'program.cancel': 'Cancel',
    'program.clear': 'Clear',
    'program.currentValue': 'Current value',
    'program.selectPlaceholder': 'Select',
    
    // Schedule
    'schedule.title': 'Programming Schedule',
    'schedule.subtitle': 'Calendar view and management of programming',
    'schedule.filterByWeek': 'Filter by Week',
    'schedule.filterByChannel': 'Filter by Channel',
    'schedule.filterByYear': 'Filter by Year',
    'schedule.allWeeks': 'All Weeks',
    'schedule.allChannels': 'All Channels',
    'schedule.allYears': 'All Years',
    'schedule.loading': 'Loading schedule...',
    'schedule.noEvents': 'No events found.',
    
    // Timeline
    'timeline.title': 'Programming Timeline',
    'timeline.subtitle': 'Timeline view of programming by channel',
    'timeline.selectDate': 'Select Date',
    'timeline.noEvents': 'No events found',
    'timeline.forSelectedWeek': 'for the selected week',
    'timeline.forSelectedDate': 'for the selected date',
    'timeline.channel': 'Channel',
    
    // User Menu
    'user.settings': 'Settings',
    'user.theme': 'Theme',
    'user.language': 'Language',
    'user.light': 'Light',
    'user.dark': 'Dark',
    'user.system': 'System',
    'user.logout': 'Sign Out',
    
    // Auth
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    
    // Messages
    'message.updateSuccess': 'Program updated successfully!',
    'message.updateError': 'Error updating program. Please try again.',
    'message.loadError': 'Error loading data',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.pt] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
