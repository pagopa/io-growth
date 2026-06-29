import { useCallback, useState } from 'react';
import type { CompleteDataFormData, Contact, ContactFormData } from '../types';
import { useCheckRequiredField } from './useCheckRequiredField';
import {
  INITIAL_FIRST_CONTACT_ERRORS,
  validateCompleteDataForm,
  type FirstContactErrors,
} from '../utils/validation';
import type {
  Address,
  OperatorProfileCreateRequest,
} from '../../../../core/api/generated/model';

const createEmptyContact = (): ContactFormData => ({
  type: '',
  value: '',
});

const isFirstContactValueField = (field: keyof ContactFormData): boolean =>
  field === 'value';

const INITIAL_FORM_DATA: CompleteDataFormData = {
  name: '',
  sede: 'fisica',
  address: '',
  contacts: [createEmptyContact()],
  logoFile: null,
  coverFile: null,
  privacyUrl: '',
  termsUrl: '',
};

type UseCompleteDataFormParams = {
  onValidSubmit?: (payload: OperatorProfileCreateRequest) => void;
};

export type UseCompleteDataFormResult = {
  formData: CompleteDataFormData;
  nameError: string;
  addressError: string;
  visibleFirstContactTypeError: string;
  visibleFirstContactValueError: string;
  handleNameChange: (value: string) => void;
  handleSedeChange: (value: 'fisica' | 'sito_web') => void;
  handleAddressChange: (value: string) => void;
  handleLogoSelect: (file: File | null) => void;
  handleCoverSelect: (file: File | null) => void;
  handleAddContact: () => void;
  handleRemoveContact: (index: number) => void;
  handleContactChange: (
    index: number,
    field: keyof ContactFormData,
    value: string,
  ) => void;
  handlePrivacyUrlChange: (value: string) => void;
  handleTermsUrlChange: (value: string) => void;
  handleContinueClick: () => void;
};

const buildSupportContacts = (contacts: ContactFormData[]) =>
  contacts
    .filter((c): c is Contact => c.type !== '' && c.value.trim() !== '')
    .map((c) => ({
      type: c.type,
      value: c.value.trim(),
    }));

export const parseAddress = (input: string): Address => {
  const parts = input.split(',').map((p) => p.trim());

  return {
    street: parts[0] || '',
    city: parts[1] || '',
    state: parts[2] || '',
    postalCode: parts[3] || '',
    country: 'IT',
  };
};

export const useCompleteDataForm = ({
  onValidSubmit,
}: UseCompleteDataFormParams = {}): UseCompleteDataFormResult => {
  const [formData, setFormData] =
    useState<CompleteDataFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FirstContactErrors>(
    INITIAL_FIRST_CONTACT_ERRORS,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = useCallback(
    <K extends keyof CompleteDataFormData>(
      field: K,
      value: CompleteDataFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAddContact = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, createEmptyContact()],
    }));
  }, []);

  const handleRemoveContact = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts:
        prev.contacts.length > 1
          ? prev.contacts.filter((_, i) => i !== index)
          : [createEmptyContact()],
    }));
  }, []);

  const handleContactChange = useCallback(
    (index: number, field: keyof ContactFormData, value: string) => {
      if (index === 0 && field === 'type') {
        setErrors(INITIAL_FIRST_CONTACT_ERRORS);
      }

      if (index === 0 && isFirstContactValueField(field)) {
        setErrors((prev) => ({
          ...prev,
          firstContactValue: '',
        }));
      }

      setFormData((prev) => ({
        ...prev,
        contacts: prev.contacts.map((contact, i) =>
          i === index ? { ...contact, [field]: value } : contact,
        ),
      }));
    },
    [],
  );

  const nameField = useCheckRequiredField({
    value: formData.name,
    required: true,
    attempted: isSubmitted,
  });

  const addressField = useCheckRequiredField({
    value: formData.address,
    required: true,
    attempted: isSubmitted,
  });

  const validateForm = useCallback(() => {
    const validation = validateCompleteDataForm(formData);
    setErrors(validation.firstContactErrors);
    return validation.isValid;
  }, [formData]);

  const handleContinueClick = useCallback(() => {
    setIsSubmitted(true);
    if (!validateForm()) return;

    const isOnline = formData.sede === 'sito_web';

    const supportContacts = buildSupportContacts(formData.contacts);

    const websiteUrl = formData.contacts.find(
      (c) => c.type === 'website',
    )?.value;

    if (isOnline && !websiteUrl) {
      return;
    }

    const place: OperatorProfileCreateRequest['place'] = isOnline
      ? {
          type: 'online',
          name: 'Sito web',
          website: {
            url: websiteUrl!.trim(),
          },
          supportContacts,
        }
      : {
          type: 'offline',
          name: 'Sede fisica',
          address: parseAddress(formData.address),
          supportContacts,
        };

    const payload: OperatorProfileCreateRequest = {
      displayName: formData.name.trim(),
      place,
    };

    onValidSubmit?.(payload);
  }, [formData, validateForm, onValidSubmit]);

  const handleNameChange = useCallback(
    (value: string) => updateField('name', value),
    [updateField],
  );

  const handleSedeChange = useCallback(
    (value: 'fisica' | 'sito_web') => updateField('sede', value),
    [updateField],
  );

  const handleAddressChange = useCallback(
    (value: string) => updateField('address', value),
    [updateField],
  );

  const handleLogoSelect = useCallback(
    (file: File | null) => updateField('logoFile', file),
    [updateField],
  );

  const handleCoverSelect = useCallback(
    (file: File | null) => updateField('coverFile', file),
    [updateField],
  );

  const handlePrivacyUrlChange = useCallback(
    (value: string) => updateField('privacyUrl', value),
    [updateField],
  );

  const handleTermsUrlChange = useCallback(
    (value: string) => updateField('termsUrl', value),
    [updateField],
  );

  const visibleFirstContactTypeError = isSubmitted
    ? errors.firstContactType
    : '';

  const visibleFirstContactValueError = isSubmitted
    ? errors.firstContactValue
    : '';

  return {
    formData,
    nameError: nameField.error ? (nameField.helperText ?? '') : '',
    addressError: addressField.error ? (addressField.helperText ?? '') : '',
    visibleFirstContactTypeError,
    visibleFirstContactValueError,
    handleNameChange,
    handleSedeChange,
    handleAddressChange,
    handleLogoSelect,
    handleCoverSelect,
    handlePrivacyUrlChange,
    handleTermsUrlChange,
    handleAddContact,
    handleRemoveContact,
    handleContactChange,
    handleContinueClick,
  };
};
