import {useRef} from 'react';

import {startPerfTrace} from '@app/helpers/perf';

export const usePerfTrace = name => {
  const traceRef = useRef(null);
  const startRef = useRef(0);

  const run = async fn => {
    traceRef.current = await startPerfTrace(name);
    startRef.current = Date.now();

    try {
      const result = await fn(traceRef.current);
      traceRef.current.putAttribute('status', 'success');
      return result;
    } catch (e) {
      traceRef.current.putAttribute('status', 'error');
      traceRef.current.putAttribute(
        'error_reason',
        e?.message || 'unknown_error',
      );
      throw e;
    } finally {
      traceRef.current.putMetric('duration_ms', Date.now() - startRef.current);
      traceRef.current.stop();
    }
  };

  return run;
};
