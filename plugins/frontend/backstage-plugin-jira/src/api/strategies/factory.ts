import { JiraProductStrategy, JiraProductStrategyOptions } from './base';
import { JiraCloudStrategy } from './cloud';
import { JiraDataCenterStrategy } from './datacenter';

export class JiraProductStrategyFactory {
  static createStrategy(product: string, options: JiraProductStrategyOptions): JiraProductStrategy {
    switch (product) {
      case 'datacenter':
        return new JiraDataCenterStrategy(options);
      default:
        return new JiraCloudStrategy(options);
    }
  }
}
