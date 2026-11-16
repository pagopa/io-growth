import { Dialog, DialogContent, Link, Stack } from '@mui/material';
import { useId, useState } from 'react';
import { AssistanceHeader } from './components/AssistanceHeader';
import { ContactsStep } from './components/ContactsStep';
import { CategoryStep } from './components/CategoryStep';
import {
  ASSISTANCE_CONTACT_BY_CATEGORY,
  ASSISTANCE_MODAL_COPY,
  type AssistanceCategory,
  TECHNICAL_SUPPORT_CONTACT,
} from './constants';

interface AssistanceModalProps {
  open: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

interface AssistanceContentProps {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
}

function OperatorAssistanceContent({
  titleId,
  descriptionId,
  onClose,
}: Readonly<AssistanceContentProps>) {
  const [step, setStep] = useState<'category' | 'contacts'>('category');
  const [category, setCategory] = useState<AssistanceCategory | null>(null);

  return (
    <>
      <AssistanceHeader
        titleId={titleId}
        descriptionId={descriptionId}
        title={ASSISTANCE_MODAL_COPY[step].title}
        subtitle={
          <>
            {step === 'category' && (
              <>
                {ASSISTANCE_MODAL_COPY.category.subtitle}
                <Link
                  // TODO: add href
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="manuale operativo (si apre in una nuova scheda)"
                  fontWeight={700}
                >
                  {ASSISTANCE_MODAL_COPY.category.manualLinkLabel}
                </Link>
                .
              </>
            )}
            {step === 'contacts' && ASSISTANCE_MODAL_COPY.contacts.subtitle}
          </>
        }
        onClose={onClose}
      />

      {step === 'category' && (
        <CategoryStep
          labelledBy={titleId}
          category={category}
          onCategoryChange={setCategory}
          onCancel={onClose}
          onContinue={() => setStep('contacts')}
        />
      )}
      {step === 'contacts' && category && (
        <ContactsStep
          contact={ASSISTANCE_CONTACT_BY_CATEGORY[category]}
          backLabel={ASSISTANCE_MODAL_COPY.contacts.back}
          onBack={() => setStep('category')}
          onConfirm={onClose}
        />
      )}
    </>
  );
}

function AdminAssistanceContent({
  titleId,
  descriptionId,
  onClose,
}: Readonly<AssistanceContentProps>) {
  return (
    <>
      <AssistanceHeader
        titleId={titleId}
        descriptionId={descriptionId}
        title={ASSISTANCE_MODAL_COPY.admin.title}
        subtitle={ASSISTANCE_MODAL_COPY.contacts.subtitle}
        onClose={onClose}
      />
      <ContactsStep
        contact={TECHNICAL_SUPPORT_CONTACT}
        backLabel={ASSISTANCE_MODAL_COPY.admin.cancel}
        onBack={onClose}
        onConfirm={onClose}
      />
    </>
  );
}

export function AssistanceModal({
  open,
  isAdmin,
  onClose,
}: Readonly<AssistanceModalProps>) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {isAdmin ? (
            <AdminAssistanceContent
              titleId={titleId}
              descriptionId={descriptionId}
              onClose={onClose}
            />
          ) : (
            <OperatorAssistanceContent
              titleId={titleId}
              descriptionId={descriptionId}
              onClose={onClose}
            />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
