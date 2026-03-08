import { useMutation } from '@tanstack/react-query';
import {
  executeLogQLFromText,
  executeStructuredLogQuery,
  type LogSource,
  type StructuredLogQuery,
} from '@/lib/logql';

export const useLogQLTextQuery = (source: LogSource = 'alerts') => {
  return useMutation({
    mutationKey: ['logql-text', source],
    mutationFn: (text: string) => executeLogQLFromText(text, source),
  });
};

export const useStructuredLogQLQuery = () => {
  return useMutation({
    mutationKey: ['logql-structured'],
    mutationFn: (query: StructuredLogQuery) => executeStructuredLogQuery(query),
  });
};
