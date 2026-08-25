import { format } from 'date-fns';
import { selectRequestForm } from '../../../features/request-form/selectors';
import { useAppSelector } from '../../../hooks';

const Cittadinanza = [
  'Italiana',
  null,
  'Paesi comunitari',
  'Paesi extracomunitari',
] as const;

export const useGetSummaryValue = () => {
  const {
    capRec,
    cognome,
    dataNascita,
    descrizioneComuneRec,
    idCittadinanza,
    indirizzoRec,
    nome,
    sesso,
    siglaProvinciaRec,
    civicoRec,
    comuneNascita,
    datiAggiuntiviRec,
    siglaProvinciaNascita,
  } = useAppSelector(selectRequestForm);

  const personalData = [
    { label: 'Nome', value: nome },
    { label: 'Cognome', value: cognome },
    { label: 'Sesso', value: sesso },
    { label: 'Data di nascita', value: format(dataNascita, 'dd/MM/yyyy') },
    { label: 'Comune di nascita', value: comuneNascita ?? '' },
    { label: 'Provincia di nascita', value: siglaProvinciaNascita ?? '' },
    { label: 'Codice Fiscale', value: 'XXXXXXXXXXXX' },
    { label: 'Cittadinanza', value: Cittadinanza[idCittadinanza] ?? '' },
  ];

  const addressData = [
    { label: 'Indirizzo', value: indirizzoRec },
    { label: 'Civico', value: civicoRec ?? '' },
    { label: 'CAP', value: capRec },
    { label: 'Comune', value: descrizioneComuneRec },
    { label: 'Provincia', value: siglaProvinciaRec },
    { label: 'Nome sul citofono', value: `${nome} ${cognome}` },
    { label: 'Altri dettagli', value: datiAggiuntiviRec ?? '' },
  ];

  return { addressData, personalData };
};
