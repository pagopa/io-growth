import { useGetSession } from '../../hooks';

const Authorize = () => {
  useGetSession();

  return <div style={{ padding: 24 }}>Loading...</div>;
};

export default Authorize;
