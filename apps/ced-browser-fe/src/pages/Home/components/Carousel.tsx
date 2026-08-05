import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
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
  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const currentExtendedIndexRef = useRef(1);

  const extendedList = [list[list.length - 1], ...list, list[0]];

  const scrollToExtendedIndex = useCallback(
    (extendedIndex: number, behavior: ScrollBehavior) => {
      const container = containerRef.current;
      if (!container) return;

      const target = container.children[extendedIndex] as
        | HTMLElement
        | undefined;
      if (!target) return;

      if (behavior === 'auto') {
        const prevBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = 'auto';
        target.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest',
        });
        requestAnimationFrame(() => {
          container.style.scrollBehavior = prevBehavior;
        });
        return;
      }

      target.scrollIntoView({
        behavior,
        inline: 'center',
        block: 'nearest',
      });
    },
    [],
  );

  useEffect(() => {
    scrollToExtendedIndex(1, 'auto');
  }, [scrollToExtendedIndex]);

  useEffect(() => {
    const urls = Array.from(
      new Set(list.flatMap((item) => [item.imageUrl, item.logoUrl])),
    );

    urls.forEach((url) => {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = url;
    });
  }, [list]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const first = container.children[0] as HTMLElement | undefined;
      const second = container.children[1] as HTMLElement | undefined;
      if (!first || !second) return;

      const step = second.offsetLeft - first.offsetLeft;
      if (step <= 0) return;

      const rawIndex = Math.round(
        (container.scrollLeft - first.offsetLeft) / step,
      );
      const extendedIndex = Math.max(
        0,
        Math.min(rawIndex, extendedList.length - 1),
      );
      currentExtendedIndexRef.current = extendedIndex;
      const mappedIndex =
        extendedIndex === 0
          ? list.length - 1
          : extendedIndex === extendedList.length - 1
            ? 0
            : extendedIndex - 1;

      setActiveIdx((prev) => (prev === mappedIndex ? prev : mappedIndex));

      if (scrollEndTimeoutRef.current) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }

      scrollEndTimeoutRef.current = window.setTimeout(() => {
        if (extendedIndex === 0) {
          isScrollingRef.current = true;
          scrollToExtendedIndex(list.length, 'auto');
          isScrollingRef.current = false;
          return;
        }

        if (extendedIndex === extendedList.length - 1) {
          isScrollingRef.current = true;
          scrollToExtendedIndex(1, 'auto');
          isScrollingRef.current = false;
        }
      }, 90);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimeoutRef.current) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [extendedList.length, list.length, scrollToExtendedIndex]);

  const onClickDots = useCallback(
    (index: number) => {
      const chosenIndex =
        index < 0 ? list.length - 1 : index >= list.length ? 0 : index;

      scrollToExtendedIndex(chosenIndex + 1, 'smooth');
    },
    [list.length, scrollToExtendedIndex],
  );

  const onStep = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'next') {
        if (activeIdx === list.length - 1) {
          scrollToExtendedIndex(list.length + 1, 'smooth');
          return;
        }
        scrollToExtendedIndex(currentExtendedIndexRef.current + 1, 'smooth');
        return;
      }

      if (activeIdx === 0) {
        scrollToExtendedIndex(0, 'smooth');
        return;
      }
      scrollToExtendedIndex(currentExtendedIndexRef.current - 1, 'smooth');
    },
    [activeIdx, list.length, scrollToExtendedIndex],
  );

  const getMappedIndex = useCallback(
    (extendedIndex: number) =>
      extendedIndex === 0
        ? list.length - 1
        : extendedIndex === extendedList.length - 1
          ? 0
          : extendedIndex - 1,
    [extendedList.length, list.length],
  );

  if (list.length === 1)
    return (
      <CarouselContainer
        component="section"
        aria-label="Carosello partner in primo piano"
      >
        <PartnerCard {...list[0]} />
      </CarouselContainer>
    );

  return (
    <CarouselContainer
      component="section"
      aria-label="Carosello partner in primo piano"
    >
      <ScrollArea
        ref={containerRef}
        role="region"
        aria-label="Elenco scorrevole partner"
      >
        {extendedList.map((item, idx) => (
          <SlideBox
            key={idx}
            role="group"
            aria-roledescription="slide"
            aria-label={`Elemento ${getMappedIndex(idx) + 1} di ${list.length}: ${item.title}`}
            aria-hidden={idx === 0 || idx === extendedList.length - 1}
          >
            <PartnerCard {...item} />
          </SlideBox>
        ))}
      </ScrollArea>

      <Stack
        direction="row"
        justifyContent="space-between"
        mt={0.5}
        alignItems="center"
      >
        <Button
          onClick={() => onStep('prev')}
          sx={{ minWidth: 0, p: 0.5 }}
          aria-label="Elemento precedente del carosello"
        >
          <ChevronLeftRounded />
        </Button>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {list.map((_, idx) => (
            <StyledDots
              key={idx}
              component="button"
              type="button"
              onClick={() => onClickDots(idx)}
              className={activeIdx === idx ? 'active' : 'inactive'}
              aria-label={`Vai all'elemento ${idx + 1} di ${list.length}`}
              aria-current={activeIdx === idx ? 'true' : undefined}
            />
          ))}
        </Stack>

        <Button
          onClick={() => onStep('next')}
          sx={{ minWidth: 0, p: 0.5 }}
          aria-label="Elemento successivo del carosello"
        >
          <ChevronRightRounded />
        </Button>
      </Stack>

      <Box
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {`Elemento ${activeIdx + 1} di ${list.length}: ${list[activeIdx]?.title ?? ''}`}
      </Box>
    </CarouselContainer>
  );
};
