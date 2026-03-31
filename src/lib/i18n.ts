// Italian translations for dotCasting platform
export const it = {
  // Navigation
  nav: {
    home: "Home",
    myCastings: "I miei Casting",
    profile: "Profilo",
    applications: "Candidature",
    messages: "Messaggi",
    
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
    invitations: "Inviti ai casting",
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

  // Notifications
  notifications: {
    title: "Notifiche",
    empty: "Nessuna notifica",
    markAllRead: "Segna tutte come lette",
  },

  // Backoffice
  backoffice: {
    dashboard: "Dashboard",
    talentDatabase: "Database Talenti",
    castings: "Casting",
    targets: "Target e Shortlist",
    applications: "Candidature",
    
    messagingCenter: "Centro Messaggi",
    companiesCRM: "CRM Aziende",
    teamPermissions: "Team e Permessi",
    settings: "Impostazioni",
    createCasting: "Crea Casting",
    searchTalents: "Cerca Talenti",
    totalTalents: "Talenti totali",
    activeCastings: "Casting attivi",
    pendingApplications: "Candidature in attesa",
    
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
    accept: "Accetta",
    decline: "Rifiuta",
  },

  // Validation
  validation: {
    required: "Campo obbligatorio",
    invalidEmail: "Email non valida",
    passwordMin: "La password deve avere almeno 8 caratteri",
    passwordMatch: "Le password non coincidono",
  },

  // Onboarding
  onboarding: {
    title: "Completa il tuo profilo",
    subtitle: "Pochi passi per iniziare la tua carriera nel casting",
    step1Title: "Seleziona i tuoi ruoli",
    step1Description: "Che tipo di talento sei?",
    step2Title: "Informazioni base",
    step2Description: "Raccontaci di te",
    step3Title: "Foto profilo",
    step3Description: "Mostra il tuo volto",
    complete: "Completa",
    completeLater: "Completa dopo",
    photoOptional: "Carica una foto professionale (opzionale)",
    photoFormat: "Formato: JPG, PNG. Massimo 5MB.",
    removePhoto: "Rimuovi foto",
  },
};

export type TranslationKey = keyof typeof it;
