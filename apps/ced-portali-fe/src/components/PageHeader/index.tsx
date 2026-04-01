import { HeaderProduct } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { productsList, partyList } from './constants';

export const PageHeader = () => {
  return (
    <Box sx={{ '& .MuiContainer-root': { px: { xs: 2, md: 3 } } }}>
      <HeaderProduct
        productsList={productsList}
        productId={productsList[0].id}
        partyList={partyList}
        partyId={partyList[0].id}
      />
    </Box>
  );
};
