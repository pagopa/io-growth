import { PartnerCard } from './PartnerCard';
import { useRef, useState } from 'react';
import { CarouselContainer, ScrollArea, SlideBox, StyledDots } from './styled';
import { Button, Stack } from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { PartnerCardProps } from './types';

type CarouselProps = {
  list: Array<PartnerCardProps>;
};
export const Carousel = ({ list }: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const handleManualScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const center = container.scrollLeft + container.offsetWidth / 2;

    const children = Array.from(container.children) as HTMLElement[];
    let closestIdx = 0;
    let minDistance = Infinity;

    // Troviamo il figlio il cui centro è più vicino al centro del contenitore
    children.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    // Aggiorniamo lo stato solo se l'indice è effettivamente cambiato
    if (closestIdx !== activeIdx) {
      setActiveIdx(closestIdx);
    }
  };

  const scrollToItem = (index: number) => {
    const container = containerRef.current;
    setTimeout(() => {
      const item = container?.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 0);
  };

  const handleUpdate = (newIdx: number) => {
    let targetIdx = newIdx;
    if (newIdx < 0) {
      targetIdx = list.length - 1;
    } else if (newIdx >= list.length) {
      targetIdx = 0;
    }

    setActiveIdx(targetIdx);
    scrollToItem(targetIdx);
  };

  if (list.length === 1)
    return (
      <CarouselContainer>
        <PartnerCard {...list[0]} />
      </CarouselContainer>
    );

  return (
    <CarouselContainer>
      {/* 2. Aggiungiamo onScroll alla ScrollArea */}
      <ScrollArea ref={containerRef} onScroll={handleManualScroll}>
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
        <Button onClick={() => handleUpdate(activeIdx - 1)}>
          <ChevronLeftRounded />
        </Button>

        <Stack direction="row" alignItems="center" spacing={1}>
          {list.map((_, idx) => (
            <StyledDots
              key={idx}
              // Qui usiamo handleUpdate per mantenere lo scroll fluido al click
              onClick={() => handleUpdate(idx)}
              className={activeIdx === idx ? 'active' : 'inactive'}
            />
          ))}
        </Stack>

        <Button onClick={() => handleUpdate(activeIdx + 1)}>
          <ChevronRightRounded />
        </Button>
      </Stack>
    </CarouselContainer>
  );
};
