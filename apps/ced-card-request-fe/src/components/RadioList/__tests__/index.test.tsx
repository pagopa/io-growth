import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppRadioList } from '../index';

describe('AppRadioList', () => {
  it('associates the validation message with options, not both group and options', () => {
    const markup = renderToStaticMarkup(
      <AppRadioList
        aria-label="Tipo di documento"
        aria-describedby="validation-error"
        options={[
          { value: 'yes', label: 'Sì' },
          { value: 'no', label: 'No' },
        ]}
      />,
    );

    const groupMarkup = markup.match(/<div[^>]*role="radiogroup"[^>]*>/)?.[0];

    expect(groupMarkup).toBeDefined();
    expect(groupMarkup).not.toContain('aria-describedby');
    expect(markup.match(/aria-describedby="validation-error"/g)).toHaveLength(
      2,
    );
  });
});
