export type BuildkiteBuildInfo = {
  id: string;
  number: number;
  message: string;
  branch: string;
  commit: string;
  pipeline: {
    provider: {
      repository: string;
    };
    slug: string;
  };
  created_at: string;
  state: string;
  rebuilt_from: {
    id: string;
  };
  url: string;
  web_url: string;
  jobs: BuildkiteJob[];
  onRestartClick: () => void;
};

export type TableProps = {
  loading: boolean;
  retry: () => void;
  builds: BuildkiteBuildInfo[];
  projectName: string;
  page: number;
  onChangePage: (page: number) => void;
  total: number;
  pageSize: number;
  onChangePageSize: (pageSize: number) => void;
};

export type BuildkiteJob = {
  state: string;
  log_url?: string;
  id: string;
};
