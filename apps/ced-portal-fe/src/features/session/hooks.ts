import { useCallback } from 'react';
import { setCredentials } from '../../core/auth/authSlice';
import { useToast } from '../../contexts';
import { useAppDispatch } from '../../hooks/store';
import { useLazyGetSessionQuery } from './api';
import { resolveRole } from './authDev/utils';
import { AuthorizeResponseUserType } from '../../core/api/generated/model';

const getRoleFromSessionResponse = (response: {
  role?: AuthorizeResponseUserType;
  user_type?: AuthorizeResponseUserType;
}) => resolveRole(response.user_type ?? response.role);

export function useAuthorize() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [trigger, result] = useLazyGetSessionQuery();

  const authorize = useCallback(
    async (id: string) => {
      const response = await trigger(id).unwrap();
      const role = getRoleFromSessionResponse(response);

      dispatch(
        setCredentials({
          token: response.session_token,
          user: {
            id: response.operator_name,
            name: `${response.first_name} ${response.last_name}`.trim(),
            email: '',
            role,
          },
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
