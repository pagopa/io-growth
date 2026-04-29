import {
  addWebsiteContact,
  removeWebsiteContact,
  selectWebsiteForm,
  updateWebsiteContact,
} from '../../../../features/website/websiteSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { ContactsSection } from '../components/ContactsSection';

export function WebsiteContactsSection() {
  const dispatch = useAppDispatch();
  const { contacts } = useAppSelector(selectWebsiteForm);

  return (
    <ContactsSection
      contacts={contacts}
      onAdd={() => dispatch(addWebsiteContact())}
      onRemove={(i) => dispatch(removeWebsiteContact(i))}
      onChange={(p) => dispatch(updateWebsiteContact(p))}
    />
  );
}
