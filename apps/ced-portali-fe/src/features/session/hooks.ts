import { setCredentials } from '../../core/auth/authSlice';
import { useToast } from '../../contexts';
import { useAppDispatch } from '../../hooks/store';
import { useLazyGetSessionQuery } from './api';

// TODO-WIP

export function useAuthorize() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [trigger, result] = useLazyGetSessionQuery();

  const authorize = async () => {
    const response = await trigger().unwrap();
    window.localStorage.setItem('STORAGE_KEY', JSON.stringify(response));
    dispatch(setCredentials(response));
    showToast('Session restored', 'success');
    return response;
  };

  return {
    authorize,
    ...result,
  };
}
