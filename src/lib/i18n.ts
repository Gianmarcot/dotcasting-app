// Italian translations for dotCasting platform
export const it = {
  // Navigation
  nav: {
    home: "Home",
    myCastings: "I miei Casting",
    profile: "Profilo",
    applications: "Candidature",
    messages: "Messaggi",
    auditions: "Provini",
    settings: "Impostazioni",
    account: "Account",
    logout: "Esci",
  },
  
  // Auth
  auth: {
    login: "Accedi",
    signup: "Registrati",
    email: "Email",
    password: "Password",
    confirmPassword: "Conferma password",
    forgotPassword: "Password dimenticata?",
    noAccount: "Non hai un account?",
    hasAccount: "Hai già un account?",
    loginTitle: "Accedi al tuo account",
    signupTitle: "Crea il tuo account",
    loginSubtitle: "Inserisci le tue credenziali per accedere",
    signupSubtitle: "Inizia la tua carriera nel mondo del casting",
  },

  // Dashboard
  dashboard: {
    welcome: "Ciao",
    activeApplications: "Candidature Attive",
    view: "Visualizza",
    profileCompletion: "Completamento del Profilo",
    profileCompletionHint: "Hai sfiorato la perfezione, manca poco per completare il tuo profilo.",
    goToProfile: "Vai al mio profilo",
    castingsForYou: "Casting per te",
    searchPlaceholder: "Cerca per parola chiave",
    viewDetails: "Visualizza dettagli",
    applyNow: "Candidati ora",
    budget: "Budget",
    location: "Location",
    period: "Periodo",
  },

  // Casting
  casting: {
    title: "Titolo",
    description: "Descrizione",
    category: "Categoria",
    compensation: "Compenso",
    locations: "Location",
    dates: "Date",
    status: "Stato",
    draft: "Bozza",
    active: "Attivo",
    closed: "Chiuso",
    apply: "Candidati",
    applied: "Candidatura inviata",
    requirements: "Requisiti",
    roles: "Ruoli",
  },

  // Profile
  profile: {
    edit: "Modifica",
    save: "Salva",
    cancel: "Annulla",
    firstName: "Nome",
    lastName: "Cognome",
    gender: "Genere",
    ethnicity: "Etnia",
    birthDate: "Data di nascita",
    city: "Città",
    country: "Paese",
    bio: "Biografia",
    photo: "Foto profilo",
    attributes: "Attributi fisici",
    height: "Altezza",
    weight: "Peso",
    hairColor: "Colore capelli",
    eyeColor: "Colore occhi",
    skills: "Competenze",
    languages: "Lingue",
    media: "Media",
    credits: "Crediti",
    education: "Formazione",
  },

  // Applications
  applications: {
    title: "Le tue candidature",
    status: {
      submitted: "Inviata",
      shortlisted: "Selezionata",
      rejected: "Rifiutata",
      hold: "In attesa",
      callback: "Callback",
      booked: "Confermata",
    },
    empty: "Non hai ancora inviato candidature",
    coverNote: "Nota di presentazione",
  },

  // Messages
  messages: {
    title: "Messaggi",
    newMessage: "Nuovo messaggio",
    send: "Invia",
    empty: "Nessun messaggio",
    placeholder: "Scrivi un messaggio...",
  },

  // Auditions
  auditions: {
    title: "Provini",
    upcoming: "Prossimi provini",
    past: "Provini passati",
    confirm: "Conferma",
    decline: "Rifiuta",
    reschedule: "Riprogramma",
    virtual: "Virtuale",
    inPerson: "In presenza",
    status: {
      invited: "Invitato",
      confirmed: "Confermato",
      declined: "Rifiutato",
      rescheduleRequested: "Riprogrammazione richiesta",
    },
  },

  // Backoffice
  backoffice: {
    dashboard: "Dashboard",
    talentDatabase: "Database Talenti",
    castings: "Casting",
    targets: "Target e Shortlist",
    applications: "Candidature",
    auditionScheduling: "Programmazione Provini",
    messagingCenter: "Centro Messaggi",
    companiesCRM: "CRM Aziende",
    teamPermissions: "Team e Permessi",
    settings: "Impostazioni",
    createCasting: "Crea Casting",
    searchTalents: "Cerca Talenti",
    totalTalents: "Talenti totali",
    activeCastings: "Casting attivi",
    pendingApplications: "Candidature in attesa",
    upcomingAuditions: "Provini in programma",
  },

  // Common
  common: {
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    confirm: "Conferma",
    cancel: "Annulla",
    delete: "Elimina",
    edit: "Modifica",
    save: "Salva",
    add: "Aggiungi",
    remove: "Rimuovi",
    search: "Cerca",
    filter: "Filtra",
    sort: "Ordina",
    noResults: "Nessun risultato",
    seeAll: "Vedi tutti",
    back: "Indietro",
    next: "Avanti",
    previous: "Precedente",
  },

  // Validation
  validation: {
    required: "Campo obbligatorio",
    invalidEmail: "Email non valida",
    passwordMin: "La password deve avere almeno 8 caratteri",
    passwordMatch: "Le password non coincidono",
  },
};

export type TranslationKey = keyof typeof it;
