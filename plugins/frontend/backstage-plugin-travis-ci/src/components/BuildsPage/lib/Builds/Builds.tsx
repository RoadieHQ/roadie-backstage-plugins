import { FC, useMemo } from 'react';
import { useBuilds } from '../../../../hooks/useBuilds';
import { CITable } from '../CITable';

export const Builds: FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const [
    { total, loading, value, projectName, page, pageSize },
    { setPage, retry, setPageSize },
  ] = useBuilds();

  const builds = useMemo(() => {
    if (value) {
      return value.map(build => ({
        ...build,
        onRestartClick: () => {
          build.onRestartClick();
          onRestart();
        },
      }));
    }

    return [];
  }, [value, onRestart]);

  return (
    <CITable
      total={total}
      loading={loading}
      retry={retry}
      builds={builds}
      projectName={projectName}
      page={page}
      onChangePage={setPage}
      pageSize={pageSize}
      onChangePageSize={setPageSize}
    />
  );
};
