// =============================================================
// TalentCardPDF.tsx — Template @react-pdf/renderer (v5)
// Scheletro: pagina bianca con padding laterale → 3 colonne uguali
// → contenuto (foto o pannello scuro) dentro la cornice.
// Pannello: container superiore (nome + dati) e footer in basso.
// Nome: Tenor Sans uppercase a sinistra, senza sillabazione.
// Testo: DM Sans (Regular + Bold statici in public/fonts).
// =============================================================

import React from "react";
import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";
import { ResolvedCard, ResolvedRow } from "./roundPreset";

// --- Font ------------------------------------------------------
Font.register({
  family: "TenorSans",
  src: "/fonts/TenorSans-Regular.ttf",
});
Font.register({
  family: "DMSans",
  fonts: [{ src: "/fonts/DMSans-Regular.ttf" }, { src: "/fonts/DMSans-Bold.ttf", fontWeight: 700 }],
});
// niente sillabazione: le parole vanno a capo solo negli spazi
Font.registerHyphenationCallback((word) => [word]);

const DISPLAY = "TenorSans";
const SANS = "DMSans";

// --- Formato pagina ---------------------------------------------
// Cella colonna calcolata per aspect ratio 2:3 (allineato a drawer e web card).
// Larghezza colonna esterna = (842 - 2*PAGE_PAD_X) / 3 ≈ 277.7pt
// Larghezza interna = 277.7 - 2*COL_PAD_X ≈ 268.7pt
// Altezza interna 2:3 = 268.7 * 1.5 ≈ 403pt → altezza pagina ≈ 403 + 2*COL_PAD_Y = 421pt
const PAGE: [number, number] = [842, 421];
const INK = "#1a1a1a";
const PAGE_BG = "#FFFFFF"; // sfondo pagina e cornice
const CREAM = "#F4F0EC"; // testo e dettagli sul pannello scuro
const HAIRLINE = "#F4F0EC";

// --- Scheletro: i tre livelli di spaziatura ----------------------
const PAGE_PAD_X = 4.5;
const COL_PAD_Y = 9;
const COL_PAD_X = 4.5;

const s = StyleSheet.create({
  // 1. wrapper pagina
  page: {
    flexDirection: "row",
    backgroundColor: PAGE_BG,
    paddingHorizontal: PAGE_PAD_X,
  },
  // 2. colonna: sempre 1/3, mai allargata dal contenuto
  col: {
    flex: 1,
    minWidth: 0,
    paddingVertical: COL_PAD_Y,
    paddingHorizontal: COL_PAD_X,
  },
  cover: { width: "100%", height: "100%", objectFit: "cover" },

  // 3. pannello scuro: blocco dentro la colonna centrale,
  //    circondato dalla cornice bianca
  panel: {
    flex: 1,
    backgroundColor: INK,
    color: CREAM,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  name: {
    fontFamily: DISPLAY,
    textAlign: "left",
    textTransform: "uppercase",
    lineHeight: 1.2,
  },
  rule: { borderBottomWidth: 0.5, borderBottomColor: HAIRLINE, marginVertical: 14 },

  cols: { flexDirection: "row", gap: 16 },
  fieldCol: { flex: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 5 },
  label: { fontFamily: SANS, fontWeight: 700 },
  value: { fontFamily: SANS, color: "#F4F0EC" },

  contact: { fontFamily: SANS, fontSize: 6.5, marginTop: 4 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CREAM,
    color: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: { fontFamily: DISPLAY, fontSize: 11 },
  footerText: { fontFamily: SANS, fontSize: 8 },
});

// Font-size adattivi per evitare overflow del pannello.
// Il pannello ha overflow:"hidden": preferiamo ridurre gradualmente
// dimensione e spaziatura piuttosto che vedere il testo tagliato.
const getNameSize = (name: string) => {
  const n = name.length;
  if (n > 28) return 13;
  if (n > 22) return 15;
  if (n > 16) return 17;
  return 19;
};
const getRowsFontSize = (rowsTotal: number) => {
  if (rowsTotal > 26) return 4.6;
  if (rowsTotal > 22) return 5;
  if (rowsTotal > 18) return 5.5;
  if (rowsTotal > 14) return 6;
  return 6.5;
};
const getRowMarginBottom = (rowsTotal: number) => {
  if (rowsTotal > 22) return 2;
  if (rowsTotal > 18) return 3;
  return 5;
};

const FieldRow = ({ row, fontSize, marginBottom }: { row: ResolvedRow; fontSize: number; marginBottom: number }) => (
  <View style={[s.row, { marginBottom }]}>
    <Text style={[s.label, { fontSize }]}>{row.label}: </Text>
    <Text style={[s.value, { fontSize }]}>{row.value}</Text>
  </View>
);

export const TalentCardPDF = ({ card }: { card: ResolvedCard }) => {
  const nameSize = getNameSize(card.nome ?? "");
  const rowsTotal = card.columns[0].length + card.columns[1].length;
  const rowFont = getRowsFontSize(rowsTotal);
  const rowMb = getRowMarginBottom(rowsTotal);
  // Massimo 2 contatti per non spingere il footer fuori pagina.
  const contactsClamped = card.contacts.slice(0, 2);

  return (
  <Document title={card.nome}>
    {/* ---------- Pagina 1: foto | scheda | foto ---------- */}
    <Page size={PAGE} style={s.page}>
      <View style={s.col}>{card.coverPhotos[0] && <Image src={card.coverPhotos[0]} style={s.cover} />}</View>

      {/* colonna centrale: stessa cornice delle altre, panel dentro */}
      <View style={s.col}>
        <View style={s.panel}>
          {/* container superiore: nome + dati */}
          <View>
            <Text style={[s.name, { fontSize: nameSize }]}>{card.nome}</Text>
            <View style={s.rule} />
            <View style={s.cols}>
              <View style={s.fieldCol}>
                {card.columns[0].map((r) => (
                  <FieldRow key={r.label} row={r} fontSize={rowFont} marginBottom={rowMb} />
                ))}
              </View>
              <View style={s.fieldCol}>
                {card.columns[1].map((r) => (
                  <FieldRow key={r.label} row={r} fontSize={rowFont} marginBottom={rowMb} />
                ))}
              </View>
            </View>
            <View style={s.rule} />
            {contactsClamped.map((r) => (
              <Text key={r.label} style={s.contact}>
                ✉ {r.value}
              </Text>
            ))}
          </View>


          {/* footer in basso */}
          <View style={s.footer}>
            <View style={s.logoDot}>
              <Text style={s.logoGlyph}>{card.agencyName ? card.agencyName.slice(0, 2).toUpperCase() : ".C"}</Text>
            </View>
            {card.showAgencyContact && card.agencyContactEmail && (
              <Text style={s.footerText}>{card.agencyContactEmail}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={s.col}>{card.coverPhotos[1] && <Image src={card.coverPhotos[1]} style={s.cover} />}</View>
    </Page>

    {/* ---------- Pagine galleria: sempre 3 celle, anche se le foto sono 1 o 2 ---------- */}
    {card.galleryPages.map((photos, i) => {
      // Pad a 3 slot per mantenere la griglia fissa: le celle vuote restano
      // invisibili (nessuna Image) e occupano comunque 1/3 di larghezza.
      const slots: (string | null)[] = [photos[0] ?? null, photos[1] ?? null, photos[2] ?? null];
      return (
        <Page key={i} size={PAGE} style={s.page}>
          {slots.map((src, j) => (
            <View key={j} style={s.col}>
              {src && <Image src={src} style={s.cover} />}
            </View>
          ))}
        </Page>
      );
    })}
  </Document>
  );
};

