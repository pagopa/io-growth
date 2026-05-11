import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { PartnerCard } from './PartnerCard';
import { CarouselContainer, ScrollArea, SlideBox, StyledDots } from './styled';
import { PartnerCardProps } from './types';

type CarouselProps = {
  list: Array<PartnerCardProps>;
};

export const Carousel = ({ list }: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Effetto per lo scroll iniziale al montaggio
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const item = container.children[0] as HTMLElement;
    if (item) {
      item.scrollIntoView({
        behavior: 'instant',
        inline: 'start',
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const isAtEnd =
          scrollLeft + containerWidth >= container.scrollWidth - 10;
        const visibleIndex = isAtEnd
          ? list.length - 1
          : Math.round(scrollLeft / containerWidth);

        if (activeIdx !== visibleIndex) {
          setActiveIdx(visibleIndex);
        }
      }, 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [list, activeIdx]);

  const onClickDots = useCallback(
    (index: number) => {
      const chosenIndex =
        index < 0 ? list.length - 1 : index >= list.length ? 0 : index;

      const container = containerRef.current;
      const item = container?.children[chosenIndex] as HTMLElement;
      item?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    },
    [list.length],
  );

  if (list.length === 1)
    return (
      <CarouselContainer>
        <PartnerCard {...list[0]} />
      </CarouselContainer>
    );

  return (
    <CarouselContainer>
      <ScrollArea ref={containerRef}>
        {list.map((item, idx) => (
          <SlideBox key={idx}>
            <PartnerCard {...item} />
          </SlideBox>
        ))}
      </ScrollArea>

      <Stack
        direction="row"
        justifyContent="space-between"
        mt={2}
        alignItems="center"
      >
        <Button onClick={() => onClickDots(activeIdx - 1)}>
          <ChevronLeftRounded />
        </Button>

        <Stack direction="row" alignItems="center" spacing={1}>
          {list.map((_, idx) => (
            <StyledDots
              key={idx}
              onClick={() => onClickDots(idx)}
              className={activeIdx === idx ? 'active' : 'inactive'}
            />
          ))}
        </Stack>

        <Button onClick={() => onClickDots(activeIdx + 1)}>
          <ChevronRightRounded />
        </Button>
      </Stack>
    </CarouselContainer>
  );
};
