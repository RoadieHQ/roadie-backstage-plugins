import { InstanceConfig } from '../service/types';

export const getArgoConfigByInstanceName = ({
  argoConfigs,
  argoInstanceName,
}: {
  argoConfigs: InstanceConfig[];
  argoInstanceName: string;
}) => {
  const matchedArgoConfig = argoConfigs.find(
    configs => configs.name === argoInstanceName,
  );
  return matchedArgoConfig;
};
