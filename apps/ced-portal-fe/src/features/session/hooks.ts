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
    dispatch(
      setCredentials({
        token: response.token,
        user: {
          ...response.user,
          // TODO: This is a temporary fix until the backend provides the role in the session response
          role: 'operator',
        },
      }),
    );
    showToast('Session restored', 'success');
    return response;
  };

  return {
    authorize,
    ...result,
  };
}
