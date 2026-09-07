import { forwardRef, useImperativeHandle, useRef } from 'react';
import { UploadDisabilityDocument } from './UploadDisabilityDocument';
import { StepRef } from '../../types';
import { SelfAttestation } from './SelfAttestation';
import { useAppSelector } from '../../../../hooks';
import { selectConfirmationForm } from '../../../../features/confirmation/reducer';

const UploadDocumentsStep = forwardRef<StepRef>(
  function UploadDocumentsStep(_, ref) {
    const selfAttestationRef = useRef<StepRef | null>(null);
    const uploadDisabilityRef = useRef<StepRef | null>(null);
    const confirmationForm = useAppSelector(selectConfirmationForm);

    const showSelfAttestation =
      confirmationForm.tipologiaUlterioreDocumentazione === 2 &&
      confirmationForm.autodichiarazioneSentenza === true;

    useImperativeHandle(ref, () => ({
      validate: () => {
        const validator = showSelfAttestation
          ? selfAttestationRef.current
          : uploadDisabilityRef.current;

        if (!validator) return true;
        return validator.validate();
      },
    }));

    return showSelfAttestation ? (
      <SelfAttestation ref={selfAttestationRef} />
    ) : (
      <UploadDisabilityDocument ref={uploadDisabilityRef} />
    );
  },
);

export default UploadDocumentsStep;
