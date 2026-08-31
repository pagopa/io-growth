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
  const isAdjustingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const currentExtendedIndexRef = useRef(1);

  const extendedList = [list[list.length - 1], ...list, list[0]];

  const mapExtendedToRealIndex = useCallback(
    (extendedIndex: number) => {
      if (extendedIndex === 0) return list.length - 1;
      if (extendedIndex === extendedList.length - 1) return 0;
      return extendedIndex - 1;
    },
    [extendedList.length, list.length],
  );

  const scrollToExtendedIndex = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const container = containerRef.current;
      if (!container) return;

      const boundedIndex = Math.max(
        0,
        Math.min(index, extendedList.length - 1),
      );
      const target = container.children[boundedIndex] as
        | HTMLElement
        | undefined;
      if (!target) return;

      // Scroll the container directly instead of scrollIntoView: the latter
      // walks up to the ancestors and moves the document's sequential focus
      // navigation starting point onto the slide, which breaks tab order.
      const delta =
        target.getBoundingClientRect().left -
        container.getBoundingClientRect().left;

      container.scrollTo({
        left:
          container.scrollLeft +
          delta -
          (container.clientWidth - target.clientWidth) / 2,
        behavior,
      });
    },
    [extendedList.length],
  );

  useEffect(() => {
    scrollToExtendedIndex(1, 'auto');
    currentExtendedIndexRef.current = 1;
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
      if (isAdjustingRef.current) return;

      const slides = Array.from(container.children) as HTMLElement[];
      if (!slides.length) return;

      const viewportCenter = container.scrollLeft + container.clientWidth / 2;

      let nearestIdx = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, idx) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = idx;
        }
      });

      currentExtendedIndexRef.current = nearestIdx;
      const mappedIdx = mapExtendedToRealIndex(nearestIdx);
      setActiveIdx((prev) => (prev === mappedIdx ? prev : mappedIdx));

      if (scrollEndTimeoutRef.current) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }

      scrollEndTimeoutRef.current = window.setTimeout(() => {
        if (nearestIdx === 0) {
          isAdjustingRef.current = true;
          scrollToExtendedIndex(list.length, 'auto');
          currentExtendedIndexRef.current = list.length;
          isAdjustingRef.current = false;
          return;
        }

        if (nearestIdx === extendedList.length - 1) {
          isAdjustingRef.current = true;
          scrollToExtendedIndex(1, 'auto');
          currentExtendedIndexRef.current = 1;
          isAdjustingRef.current = false;
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimeoutRef.current) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [
    extendedList.length,
    list.length,
    mapExtendedToRealIndex,
    scrollToExtendedIndex,
  ]);

  const onClickDots = useCallback(
    (index: number) => {
      scrollToExtendedIndex(index + 1, 'smooth');
    },
    [scrollToExtendedIndex],
  );

  const onStep = useCallback(
    (direction: 'prev' | 'next') => {
      const current = currentExtendedIndexRef.current;

      if (direction === 'next') {
        const nextExtended =
          current >= list.length ? list.length + 1 : current + 1;
        scrollToExtendedIndex(nextExtended, 'smooth');
        return;
      }

      const prevExtended = current <= 1 ? 0 : current - 1;
      scrollToExtendedIndex(prevExtended, 'smooth');
    },
    [list.length, scrollToExtendedIndex],
  );

  if (list.length === 1)
    return (
      <CarouselContainer
        role="region"
        aria-label="Carosello partner in primo piano"
      >
        <PartnerCard {...list[0]} />
      </CarouselContainer>
    );

  return (
    <CarouselContainer
      role="region"
      aria-label="Carosello partner in primo piano"
    >
      <ScrollArea ref={containerRef} role="list" aria-label="Elenco partner">
        {extendedList.map((item, idx) => {
          const isLoopDuplicate = idx === 0 || idx === extendedList.length - 1;

          return (
            <SlideBox
              key={`${item.title}-${idx}`}
              role="listitem"
              aria-roledescription="slide"
              aria-label={
                isLoopDuplicate
                  ? undefined
                  : `Elemento ${mapExtendedToRealIndex(idx) + 1} di ${list.length}: ${item.title}`
              }
              aria-hidden={isLoopDuplicate ? true : undefined}
            >
              <PartnerCard {...item} isInert={isLoopDuplicate} />
            </SlideBox>
          );
        })}
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
              type="button"
              onClick={() => onClickDots(idx)}
              className={activeIdx === idx ? 'active' : 'inactive'}
              aria-label={`Vai all'elemento ${idx + 1} di ${list.length}`}
              aria-current={activeIdx === idx}
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
    </CarouselContainer>
  );
};
