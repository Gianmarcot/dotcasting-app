/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  siteName?: string
  loginUrl?: string
  resetUrl?: string
}

const Email = ({
  siteName = 'dotCasting',
  loginUrl = 'https://app.dotcasting.com/auth',
  resetUrl = 'https://app.dotcasting.com/auth',
}: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Hai già un account {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hai già un account {siteName}</Heading>
        <Text style={text}>
          Qualcuno ha provato a registrarsi su {siteName} con questo indirizzo.
        </Text>
        <Text style={text}>
          Se sei stato tu, non serve registrarti di nuovo: il tuo account esiste già.
          Puoi accedere con la tua password, oppure reimpostarla se non la ricordi.
        </Text>
        <Section style={buttons}>
          <Button style={button} href={loginUrl}>
            Accedi
          </Button>
          <Button style={buttonSecondary} href={resetUrl}>
            Reimposta la password
          </Button>
        </Section>
        <Text style={footer}>
          Se non sei stato tu, puoi ignorare questo messaggio: non abbiamo creato nessun
          account e non è cambiato nulla.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Hai già un account dotCasting',
  displayName: 'Account già esistente',
  previewData: {
    siteName: 'dotCasting',
    loginUrl: 'https://app.dotcasting.com/auth',
    resetUrl: 'https://app.dotcasting.com/auth',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const buttons = { margin: '0 0 25px' }
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #000000',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
  marginRight: '12px',
}
const buttonSecondary = {
  backgroundColor: '#ffffff',
  color: '#000000',
  fontSize: '14px',
  border: '1px solid #c7c7c7',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }

export default Email
