import { Button, FormControl, FormHelperText, Stack } from '@mui/material';
import { useId, useState } from 'react';
import { AppRadioGroup } from '../../RadioGroup';
import { ASSISTANCE_MODAL_COPY, ASSISTANCE_TOPIC_OPTIONS } from '../constants';
import {
  type AssistanceTopic,
  isAssistanceTopic,
} from '../utils/assistanceTopic';

interface TopicStepProps {
  labelledBy: string;
  topic: AssistanceTopic | null;
  onTopicChange: (topic: AssistanceTopic) => void;
  onCancel: () => void;
  onContinue: (topic: AssistanceTopic) => void;
}

export function TopicStep({
  labelledBy,
  topic,
  onTopicChange,
  onCancel,
  onContinue,
}: Readonly<TopicStepProps>) {
  const errorId = useId();
  const [showError, setShowError] = useState(false);

  return (
    <>
      <FormControl error={showError}>
        <AppRadioGroup
          row={false}
          name="assistance-topic"
          aria-labelledby={labelledBy}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          value={topic ?? ''}
          onChange={(event) => {
            const { value } = event.target;
            if (isAssistanceTopic(value)) {
              onTopicChange(value);
              setShowError(false);
            }
          }}
          options={ASSISTANCE_TOPIC_OPTIONS}
          sx={{
            gap: 3,
            flexWrap: 'nowrap',
            '& .MuiFormControlLabel-root': { alignItems: 'flex-start' },
            '& .MuiRadio-root': { mt: '-11px' },
          }}
        />
        {showError && (
          <FormHelperText id={errorId} role="alert" sx={{ mx: 0, mt: 2 }}>
            {ASSISTANCE_MODAL_COPY.topic.selectionError}
          </FormHelperText>
        )}
      </FormControl>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="text" onClick={onCancel}>
          {ASSISTANCE_MODAL_COPY.topic.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            topic === null ? setShowError(true) : onContinue(topic)
          }
        >
          {ASSISTANCE_MODAL_COPY.topic.continue}
        </Button>
      </Stack>
    </>
  );
}
