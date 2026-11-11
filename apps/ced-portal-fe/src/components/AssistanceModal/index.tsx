import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useId, useRef, useState } from 'react';
import { ContactsStep } from './components/ContactsStep';
import { TopicStep } from './components/TopicStep';
import { ASSISTANCE_MODAL_COPY, OPERATIONAL_MANUAL_URL } from './constants';
import {
  type AssistanceStep,
  type AssistanceTopic,
  getNextStep,
} from './utils/assistanceTopic';

interface AssistanceContentProps {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
}

function AssistanceContent({
  titleId,
  descriptionId,
  onClose,
}: Readonly<AssistanceContentProps>) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<AssistanceStep>('topic');
  const [topic, setTopic] = useState<AssistanceTopic | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, [step]);

  return (
    <DialogContent sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              component="h2"
              variant="h5"
              fontWeight={700}
              sx={{ outline: 'none' }}
            >
              {ASSISTANCE_MODAL_COPY[step].title}
            </Typography>
            <IconButton
              aria-label={ASSISTANCE_MODAL_COPY.closeAriaLabel}
              onClick={onClose}
              size="small"
              sx={{ color: 'common.neutralBlack' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            {step === 'topic' ? (
              <>
                {ASSISTANCE_MODAL_COPY.topic.subtitle}
                <Link
                  href={OPERATIONAL_MANUAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ASSISTANCE_MODAL_COPY.topic.manualLinkAriaLabel}
                  fontWeight={700}
                >
                  {ASSISTANCE_MODAL_COPY.topic.manualLinkLabel}
                </Link>
                .
              </>
            ) : (
              ASSISTANCE_MODAL_COPY.contacts.subtitle
            )}
          </Typography>
        </Stack>

        {step === 'topic' ? (
          <TopicStep
            labelledBy={titleId}
            topic={topic}
            onTopicChange={setTopic}
            onCancel={onClose}
            onContinue={(selectedTopic) => {
              const nextStep = getNextStep(selectedTopic);
              if (nextStep) {
                setStep(nextStep);
              }
            }}
          />
        ) : (
          <ContactsStep onBack={() => setStep('topic')} onConfirm={onClose} />
        )}
      </Stack>
    </DialogContent>
  );
}

interface AssistanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function AssistanceModal({
  open,
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
      <AssistanceContent
        titleId={titleId}
        descriptionId={descriptionId}
        onClose={onClose}
      />
    </Dialog>
  );
}
