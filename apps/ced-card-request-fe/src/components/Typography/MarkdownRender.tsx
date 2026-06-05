import { Box, Link } from '@mui/material';
import { Body, Title } from '.';

type MarkdownRendererProps = {
  content: string;
};

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const boldRegex = /\*\*(.*?)\*\*/g;
const italicRegex = /\*(.*?)\*/g;
const smallRegex = /\^\^(.*?)\^\^/g;
const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

const renderInline = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];

  let lastIndex = 0;

  const combinedRegex = new RegExp(
    `${imageRegex.source}|${linkRegex.source}|${boldRegex.source}|${italicRegex.source}|${smallRegex.source}`,
    'g',
  );

  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (
      match[1] !== undefined &&
      match[2] !== undefined &&
      match[0].startsWith('!')
    ) {
      nodes.push(
        <Box
          component="img"
          key={match.index}
          src={match[2]}
          alt={match[1]}
          sx={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 1,
            my: 1,
          }}
        />,
      );
    } else if (match[3] && match[4]) {
      nodes.push(
        <Link
          key={match.index}
          href={match[4]}
          target="_blank"
          rel="noreferrer"
        >
          {match[3]}
        </Link>,
      );
    } else if (match[5]) {
      nodes.push(<strong key={match.index}>{match[5]}</strong>);
    } else if (match[6]) {
      nodes.push(<em key={match.index}>{match[6]}</em>);
    } else if (match[7]) {
      nodes.push(
        <Body key={match.index} fontSize="14px">
          {renderInline(match[7])}
        </Body>,
      );
    }

    lastIndex = combinedRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const lines = content.split('\n');

  return (
    <Box>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <Box key={index} height={16} />;
        }

        if (trimmed.startsWith('# ')) {
          return <Title key={index} text={trimmed.slice(2)} variant="XL" />;
        }

        if (trimmed.startsWith('## ')) {
          return <Title key={index} text={trimmed.slice(3)} variant="LG" />;
        }

        if (trimmed.startsWith('### ')) {
          return <Title key={index} text={trimmed.slice(4)} variant="MD" />;
        }

        if (trimmed.startsWith('#### ')) {
          return <Title key={index} text={trimmed.slice(5)} variant="SM" />;
        }

        if (trimmed.startsWith('##### ')) {
          return <Title key={index} text={trimmed.slice(6)} variant="XS" />;
        }

        if (trimmed.startsWith('![')) {
          const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);

          if (match) {
            return (
              <Box
                key={index}
                component="img"
                src={match[2]}
                alt={match[1]}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2,
                }}
              />
            );
          }
        }

        if (trimmed.startsWith('- ')) {
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 1,
                ml: 2,
                alignItems: 'baseline',
              }}
            >
              <Body>•</Body>
              <Body>{renderInline(trimmed.slice(2))}</Body>
            </Box>
          );
        }

        return <Body key={index}>{renderInline(trimmed)}</Body>;
      })}
    </Box>
  );
};
