import { useCallback } from 'react';
import { setCredentials } from '../../core/auth/authSlice';
import { useToast } from '../../contexts';
import { useAppDispatch } from '../../hooks/store';
import { useLazyGetSessionQuery } from './api';

export function useAuthorize() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [trigger, result] = useLazyGetSessionQuery();

  const authorize = useCallback(
    async (id: string) => {
      const response = await trigger(id).unwrap();

      const { session_token, ...rest } = response;

      dispatch(
        setCredentials({
          token: session_token,
          user: rest,
        }),
      );

      showToast('Session restored', 'success');
      return response;
    },
    [dispatch, showToast, trigger],
  );

  return {
    authorize,
    ...result,
  };
}
