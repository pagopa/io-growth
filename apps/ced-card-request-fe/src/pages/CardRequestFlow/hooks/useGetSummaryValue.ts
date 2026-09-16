import { format } from 'date-fns';
import { selectRequestForm } from '../../../features/request-form/selectors';
import { useAppSelector } from '../../../hooks';
import { selectConfirmationForm } from '../../../features/confirmation/reducer';

const Cittadinanza = [
  'Italiana',
  null,
  'Paesi comunitari',
  'Paesi extracomunitari',
] as const;

const getKeysByDocType = (docType: number | null | undefined) => {
  switch (docType) {
    case 1:
      return [{ key: 'nomeFile', label: 'Nome del file' }];
    case 2:
      return [
        { key: 'siglaProvinciaTribunale', label: 'Provincia' },
        { key: 'descrizioneComuneTribunale', label: 'Comune' },
        { key: 'dataSentenza', label: 'Data di rilascio' },
      ];
    case 3:
      return [{ key: 'nomeFile', label: 'Nome del file' }];
    default:
      return [];
  }
};

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

  const confirmationForm = useAppSelector(selectConfirmationForm);

  const confirmationData = getKeysByDocType(
    confirmationForm.tipologiaUlterioreDocumentazione,
  ).map(({ key, label }) => ({
    label,
    value: confirmationForm[key as keyof typeof confirmationForm] ?? '',
  }));

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

  return { addressData, personalData, confirmationData };
};
