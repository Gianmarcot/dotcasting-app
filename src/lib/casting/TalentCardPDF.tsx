// =============================================================
// TalentCardPDF.tsx — Template @react-pdf/renderer
// Pagina 1: foto | pannello scuro | foto (come da mock).
// Pagine successive: galleria a 3 foto, generate dal preset.
// =============================================================

import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ResolvedCard, ResolvedRow } from "./roundPreset";

// --- Font ------------------------------------------------------
// Nessun font del brand presente in public/fonts: si usa Helvetica
// come fallback. Quando i file saranno disponibili, registrare:
//
// Font.register({ family: "DotDisplay", src: "/fonts/DotDisplay-Regular.otf" });
// Font.register({
//   family: "DotSans",
//   fonts: [
//     { src: "/fonts/DotSans-Regular.otf" },
//     { src: "/fonts/DotSans-Bold.otf", fontWeight: 700 },
//   ],
// });
const DISPLAY = "Helvetica"; // → "DotDisplay" quando registrato
const SANS = "Helvetica"; // → "DotSans"

// --- Formato pagina ---------------------------------------------
const PAGE: [number, number] = [842, 472];
const INK = "#1a1a1a";
const PAPER = "#F4F0EC";
const HAIRLINE = "#F4F0EC";

const s = StyleSheet.create({
  page: { flexDirection: "row", backgroundColor: PAPER },
  col: { flex: 1 },
  cover: { width: "100%", height: "100%", objectFit: "cover" },

  panel: {
    flex: 1,
    backgroundColor: INK,
    color: PAPER,
    paddingHorizontal: 26,
    paddingVertical: 30,
    justifyContent: "space-between",
  },
  name: {
    fontFamily: DISPLAY,
    fontSize: 27,
    textAlign: "center",
    lineHeight: 1.15,
    marginTop: 18,
  },
  rule: { borderBottomWidth: 0.5, borderBottomColor: HAIRLINE, marginVertical: 14 },

  cols: { flexDirection: "row", gap: 14 },
  fieldCol: { flex: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 7 },
  label: { fontFamily: SANS, fontSize: 7.5, fontWeight: 700 },
  value: { fontFamily: SANS, fontSize: 7.5, color: "rgba(255,255,255,0.85)" },

  contact: { fontFamily: SANS, fontSize: 8, marginTop: 4 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PAPER,
    color: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: { fontFamily: DISPLAY, fontSize: 11 },
  footerText: { fontFamily: SANS, fontSize: 8 },

  galleryPage: { flexDirection: "row", backgroundColor: PAPER, gap: 6, padding: 6 },
});

const FieldRow = ({ row }: { row: ResolvedRow }) => (
  <View style={s.row}>
    <Text style={s.label}>{row.label}: </Text>
    <Text style={s.value}>{row.value}</Text>
  </View>
);

export const TalentCardPDF = ({ card }: { card: ResolvedCard }) => (
  <Document title={card.nome}>
    {/* ---------- Pagina 1: foto | scheda | foto ---------- */}
    <Page size={PAGE} style={s.page}>
      <View style={s.col}>{card.coverPhotos[0] && <Image src={card.coverPhotos[0]} style={s.cover} />}</View>

      <View style={s.panel}>
        <Text style={s.name}>{card.nome}</Text>

        <View>
          <View style={s.rule} />
          <View style={s.cols}>
            <View style={s.fieldCol}>
              {card.columns[0].map((r) => (
                <FieldRow key={r.label} row={r} />
              ))}
            </View>
            <View style={s.fieldCol}>
              {card.columns[1].map((r) => (
                <FieldRow key={r.label} row={r} />
              ))}
            </View>
          </View>
          <View style={s.rule} />
          {card.contacts.map((r) => (
            <Text key={r.label} style={s.contact}>
              ✉ {r.value}
            </Text>
          ))}
        </View>

        <View style={s.footer}>
          <View style={s.logoDot}>
            <Text style={s.logoGlyph}>.C</Text>
          </View>
          {card.showAgencyContact && <Text style={s.footerText}>info@dotcasting.com</Text>}
        </View>
      </View>

      <View style={s.col}>{card.coverPhotos[1] && <Image src={card.coverPhotos[1]} style={s.cover} />}</View>
    </Page>

    {/* ---------- Pagine galleria: 3 foto per pagina ---------- */}
    {card.galleryPages.map((photos, i) => (
      <Page key={i} size={PAGE} style={s.galleryPage}>
        {photos.map((src) => (
          <View key={src} style={s.col}>
            <Image src={src} style={s.cover} />
          </View>
        ))}
      </Page>
    ))}
  </Document>
);
