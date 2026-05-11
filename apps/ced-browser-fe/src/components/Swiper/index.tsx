import { Box } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { Children } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

export const Swiper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Stack
        sx={{
          '& .swiper': {
            height: '100%',
            width: '100%',
          },
          '.swiper-slide': {
            height: 'auto',
            width: 'fit-content',
          },
        }}
      >
        <ReactSwiper
          className="ced-browser-swiper"
          modules={[Pagination, Navigation]}
          navigation={{
            disabledClass: 'Mui-disabled',
            lockClass: 'ced-browser-hidden',
            nextEl: '.ced-browser-swiper-button-next',
            prevEl: '.ced-browser-swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            el: '.ced-browser-swiper-pagination',
          }}
          spaceBetween={30}
        >
          {Children.map(children, (child: React.ReactNode, index) => (
            <SwiperSlide key={`slide-${index}`}>{child}</SwiperSlide>
          ))}
        </ReactSwiper>
      </Stack>
      <Box
        className="ced-browser-swiper-pagination"
        component="div"
        display="flex"
        justifyContent="center"
        paddingTop={2}
        sx={{
          '& .swiper-pagination-bullet-active': {
            backgroundColor: '#0073E6',
            borderRadius: '15px',
            height: 4,
            width: 16,
          },
        }}
      />
    </>
  );
};
