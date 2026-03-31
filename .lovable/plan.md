

## Migliorare UX categorie gallery e rimuovere barra progresso

### Problema
1. Le tab delle categorie vanno in overflow orizzontale con uno scroll nascosto, rendendo difficile scoprire le categorie non visibili.
2. La barra di progressione nella sezione "Foto principali" è ridondante rispetto al badge.

### Soluzione

**`src/components/profile/MediaGallerySection.tsx`**

1. **Sostituire le tab orizzontali con una griglia di chip/pulsanti su più righe** (righe 243-257):
   - Rimuovere `overflow-x-auto` e `w-max`
   - Usare `TabsList` con `flex flex-wrap gap-2` per disporre le categorie su più righe quando necessario
   - Ogni chip mostra il conteggio e resta sempre visibile senza scroll

2. **Rimuovere la barra di progressione** (righe 266-284):
   - Eliminare `<Progress>` e il conteggio "X/4 foto caricate"
   - Mantenere solo il badge "Minimo 4 foto richieste" (quando sotto soglia) e "Requisito soddisfatto" (quando raggiunto)
   - Rimuovere import `Progress`

### Dettaglio tecnico

```tsx
// Tab list: da scroll orizzontale a wrap multi-riga
<TabsList className="flex flex-wrap gap-2 h-auto p-0 mb-4">
  {MEDIA_CATEGORIES.map((cat) => {
    const count = getMediaForCategory(cat.key).length;
    return (
      <TabsTrigger key={cat.key} value={cat.key} className="text-xs sm:text-sm">
        {cat.label}
        <Badge ...>{count}</Badge>
      </TabsTrigger>
    );
  })}
</TabsList>

// Main photos: solo badge, senza Progress
{isMain && mainPhotosCount < mainPhotosMin && (
  <div className="mb-4">
    <Badge variant="destructive">Minimo {mainPhotosMin} foto richieste</Badge>
  </div>
)}
{isMain && mainPhotosCount >= mainPhotosMin && (
  <div className="mb-4">
    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Requisito soddisfatto</Badge>
  </div>
)}
```

### File da modificare

| File | Modifica |
|------|----------|
| `src/components/profile/MediaGallerySection.tsx` | Wrap multi-riga per tab, rimuovere Progress |

