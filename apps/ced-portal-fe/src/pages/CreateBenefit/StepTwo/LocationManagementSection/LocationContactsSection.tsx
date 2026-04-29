import {
  addLocationContact,
  removeLocationContact,
  selectLocationForm,
  updateLocationContact,
} from '../../../../features/location/locationSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { ContactsSection } from '../components/ContactsSection';

export function LocationContactsSection() {
  const dispatch = useAppDispatch();
  const { contacts } = useAppSelector(selectLocationForm);

  return (
    <ContactsSection
      contacts={contacts}
      onAdd={() => dispatch(addLocationContact())}
      onRemove={(i) => dispatch(removeLocationContact(i))}
      onChange={(p) => dispatch(updateLocationContact(p))}
    />
  );
}
