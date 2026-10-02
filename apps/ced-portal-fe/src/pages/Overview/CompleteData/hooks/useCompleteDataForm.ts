import { useCallback, useEffect, useState } from 'react';
import type { CompleteDataFormData, Contact, ContactFormData } from '../types';
import { useCheckRequiredField } from './useCheckRequiredField';
import {
  INITIAL_FIRST_CONTACT_ERRORS,
  validateCompleteDataForm,
  type FirstContactErrors,
} from '../utils/validation';
import type {
  Address,
  OperatorProfileResponse,
  OperatorProfileCreateRequest,
} from '../../../../generated/model';

const createEmptyContact = (): ContactFormData => ({
  type: 'email',
  value: '',
});

const IMAGE_SIZE_ERROR =
  'L’immagine supera la dimensione massima consentita. Riprova';

const exceedsImageDimensions = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
): Promise<boolean> => {
  const bitmap = await createImageBitmap(file);
  const exceedsLimit = bitmap.width > maxWidth || bitmap.height > maxHeight;
  bitmap.close();
  return exceedsLimit;
};

const isFirstContactValueField = (field: keyof ContactFormData): boolean =>
  field === 'value';

const INITIAL_FORM_DATA: CompleteDataFormData = {
  name: '',
  sede: '',
  websiteUrl: '',
  street: '',
  city: '',
  postalCode: '',
  province: '',
  contacts: [createEmptyContact()],
  internalEmail: '',
  logoFile: null,
  coverFile: null,
  privacyUrl: '',
  termsUrl: '',
};

type UseCompleteDataFormParams = {
  profile?: OperatorProfileResponse;
  onValidSubmit?: (
    payload: OperatorProfileCreateRequest,
    files: { logo?: File; image?: File },
  ) => void;
};

export type UseCompleteDataFormResult = {
  isSubmitted: boolean;
  formData: CompleteDataFormData;
  sedeError: string;
  nameError: string;
  websiteUrlError: string;
  streetError: string;
  cityError: string;
  postalCodeError: string;
  provinceError: string;
  logoError: string;
  coverError: string;
  privacyUrlError: string;
  termsUrlError: string;
  internalEmailError: string;
  visibleFirstContactTypeError: string;
  visibleFirstContactValueError: string;
  handleNameChange: (value: string) => void;
  handleSedeChange: (value: '' | 'fisica' | 'sito_web') => void;
  handleWebsiteUrlChange: (value: string) => void;
  handleStreetChange: (value: string) => void;
  handleCityChange: (value: string) => void;
  handlePostalCodeChange: (value: string) => void;
  handleProvinceChange: (value: string) => void;
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
  handleInternalEmailChange: (value: string) => void;
  handleContinueClick: () => void;
};

const buildSupportContacts = (contacts: ContactFormData[]) =>
  contacts
    .filter((c): c is Contact => !!c.type && !!c.value.trim())
    .map((c) => ({
      type: c.type,
      value: c.value.trim(),
    }));

export const useCompleteDataForm = ({
  profile,
  onValidSubmit,
}: UseCompleteDataFormParams = {}): UseCompleteDataFormResult => {
  const [formData, setFormData] =
    useState<CompleteDataFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FirstContactErrors>(
    INITIAL_FIRST_CONTACT_ERRORS,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const place = profile.place;
    const isOnline = place.type === 'online';

    setFormData((prev) => ({
      ...prev,
      name: profile.displayName,
      sede: isOnline ? 'sito_web' : 'fisica',
      websiteUrl: isOnline ? place.website.url : '',
      street: isOnline ? '' : place.address.street,
      city: isOnline ? '' : place.address.city,
      postalCode: isOnline ? '' : place.address.postalCode,
      province: isOnline ? '' : place.address.state,
      contacts: place.supportContacts.map(({ type, value }) => ({
        type,
        value,
      })),
      internalEmail: profile.contactEmail,
      privacyUrl: profile.privacyUrl,
      termsUrl: profile.tosUrl,
    }));
  }, [profile]);

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

  const [logoError, setLogoError] = useState('');
  const [coverError, setCoverError] = useState('');
  const [internalEmailError, setInternalEmailError] = useState('');
  const [privacyUrlError, setPrivacyUrlError] = useState('');
  const [termsUrlError, setTermsUrlError] = useState('');

  const websiteUrlField = useCheckRequiredField({
    value: formData.websiteUrl,
    required: formData.sede === 'sito_web',
    attempted: isSubmitted,
  });

  const streetField = useCheckRequiredField({
    value: formData.street,
    required: formData.sede === 'fisica',
    attempted: isSubmitted,
  });

  const cityField = useCheckRequiredField({
    value: formData.city,
    required: formData.sede === 'fisica',
    attempted: isSubmitted,
  });

  const postalCodeField = useCheckRequiredField({
    value: formData.postalCode,
    required: formData.sede === 'fisica',
    attempted: isSubmitted,
  });

  const provinceField = useCheckRequiredField({
    value: formData.province,
    required: formData.sede === 'fisica',
    attempted: isSubmitted,
  });

  const validateForm = useCallback(() => {
    const validation = validateCompleteDataForm(formData, !profile);
    setErrors(validation.firstContactErrors);
    setLogoError(validation.logoError);
    setCoverError(validation.coverError);
    setInternalEmailError(validation.internalEmailError);
    setPrivacyUrlError(validation.privacyUrlError);
    setTermsUrlError(validation.termsUrlError);
    return validation.isValid;
  }, [formData, profile]);

  const handleContinueClick = useCallback(() => {
    setIsSubmitted(true);
    if (!validateForm()) return;
    if (!formData.sede) return;

    const isOnline = formData.sede === 'sito_web';

    const supportContacts = buildSupportContacts(formData.contacts);

    const placeWebsiteUrl = formData.websiteUrl.trim();

    if (isOnline && !placeWebsiteUrl) {
      return;
    }

    const place: OperatorProfileCreateRequest['place'] = isOnline
      ? {
          type: 'online',
          name: 'Sito web',
          website: {
            url: placeWebsiteUrl,
          },
          supportContacts,
        }
      : {
          type: 'offline',
          name: 'Sede fisica',
          address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.province.trim(),
            postalCode: formData.postalCode.trim(),
            country: 'IT',
          } as Address,
          supportContacts,
        };

    if (!profile && (!formData.logoFile || !formData.coverFile)) return;

    const payload: OperatorProfileCreateRequest = {
      displayName: formData.name.trim(),
      contactEmail: formData.internalEmail.trim(),
      place,
      privacyUrl: formData.privacyUrl.trim(),
      tosUrl: formData.termsUrl.trim(),
    };

    onValidSubmit?.(payload, {
      ...(formData.logoFile ? { logo: formData.logoFile } : {}),
      ...(formData.coverFile ? { image: formData.coverFile } : {}),
    });
  }, [formData, profile, validateForm, onValidSubmit]);

  const handleNameChange = useCallback(
    (value: string) => updateField('name', value),
    [updateField],
  );

  const handleSedeChange = useCallback(
    (value: '' | 'fisica' | 'sito_web') => updateField('sede', value),
    [updateField],
  );

  const handleWebsiteUrlChange = useCallback(
    (value: string) => updateField('websiteUrl', value),
    [updateField],
  );

  const handleStreetChange = useCallback(
    (value: string) => updateField('street', value),
    [updateField],
  );

  const handleCityChange = useCallback(
    (value: string) => updateField('city', value),
    [updateField],
  );

  const handlePostalCodeChange = useCallback(
    (value: string) => updateField('postalCode', value),
    [updateField],
  );

  const handleProvinceChange = useCallback(
    (value: string) => updateField('province', value),
    [updateField],
  );

  const handleLogoSelect = useCallback(
    async (file: File | null) => {
      if (!file) {
        updateField('logoFile', null);
        return;
      }

      try {
        if (await exceedsImageDimensions(file, 300, 300)) {
          updateField('logoFile', null);
          setLogoError(IMAGE_SIZE_ERROR);
          return;
        }
        updateField('logoFile', file);
        setLogoError('');
      } catch {
        updateField('logoFile', null);
        setLogoError('Impossibile leggere l’immagine. Riprova');
      }
    },
    [updateField],
  );

  const handleCoverSelect = useCallback(
    async (file: File | null) => {
      if (!file) {
        updateField('coverFile', null);
        return;
      }

      try {
        if (await exceedsImageDimensions(file, 300, 600)) {
          updateField('coverFile', null);
          setCoverError(IMAGE_SIZE_ERROR);
          return;
        }
        updateField('coverFile', file);
        setCoverError('');
      } catch {
        updateField('coverFile', null);
        setCoverError('Impossibile leggere l’immagine. Riprova');
      }
    },
    [updateField],
  );

  const handlePrivacyUrlChange = useCallback(
    (value: string) => {
      updateField('privacyUrl', value);
      setPrivacyUrlError('');
    },
    [updateField],
  );

  const handleTermsUrlChange = useCallback(
    (value: string) => {
      updateField('termsUrl', value);
      setTermsUrlError('');
    },
    [updateField],
  );

  const handleInternalEmailChange = useCallback(
    (value: string) => {
      updateField('internalEmail', value);
      setInternalEmailError('');
    },
    [updateField],
  );

  const visibleFirstContactTypeError = isSubmitted
    ? errors.firstContactType
    : '';

  const visibleFirstContactValueError = isSubmitted
    ? errors.firstContactValue
    : '';

  const sedeError =
    isSubmitted && !formData.sede
      ? '* Seleziona un campo tra Sede fisica o Sito web'
      : '';

  return {
    isSubmitted,
    formData,
    sedeError,
    nameError: nameField.error ? (nameField.helperText ?? '') : '',
    websiteUrlError: websiteUrlField.error
      ? (websiteUrlField.helperText ?? '')
      : '',
    streetError: streetField.error ? (streetField.helperText ?? '') : '',
    cityError: cityField.error ? (cityField.helperText ?? '') : '',
    postalCodeError: postalCodeField.error
      ? (postalCodeField.helperText ?? '')
      : '',
    provinceError: provinceField.error ? (provinceField.helperText ?? '') : '',
    logoError,
    coverError,
    privacyUrlError,
    termsUrlError,
    internalEmailError,
    visibleFirstContactTypeError,
    visibleFirstContactValueError,
    handleNameChange,
    handleSedeChange,
    handleWebsiteUrlChange,
    handleStreetChange,
    handleCityChange,
    handlePostalCodeChange,
    handleProvinceChange,
    handleLogoSelect,
    handleCoverSelect,
    handlePrivacyUrlChange,
    handleTermsUrlChange,
    handleInternalEmailChange,
    handleAddContact,
    handleRemoveContact,
    handleContactChange,
    handleContinueClick,
  };
};
