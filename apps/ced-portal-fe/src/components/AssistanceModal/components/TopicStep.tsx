import { Button, FormControl, FormHelperText, Stack } from '@mui/material';
import { type ChangeEvent, useId, useState } from 'react';
import { AppRadioGroup } from '../../RadioGroup';
import {
  ASSISTANCE_MODAL_COPY,
  ASSISTANCE_TOPIC_OPTIONS,
  ASSISTANCE_TOPICS,
  type AssistanceTopic,
} from '../constants';

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

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const isValidTopic = (ASSISTANCE_TOPICS as readonly string[]).includes(
      value,
    );

    if (isValidTopic) {
      onTopicChange(value as AssistanceTopic);
      setShowError(false);
    }
  };

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
          onChange={onChange}
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
