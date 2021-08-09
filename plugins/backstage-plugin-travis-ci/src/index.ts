export {
  /**
   * @deprecated From 0.2.0 new name 'travisciPlugin' should be used
   */
  travisciPlugin as plugin,
  travisciPlugin,
  EntityTravisCIContent,
  EntityTravisCIOverviewCard,
} from './plugin';
export * from './api';
export {
  /**
   * @deprecated From 0.2.0 composability API should be used
   */
  Router,
  /**
   * @deprecated From 0.2.0 new name 'isTravisciAvailable' should be used
   */
  isTravisciAvailable as isPluginApplicableToEntity,
  isTravisciAvailable,
} from './Router';
export {
  /**
   * @deprecated From 0.2.0 composability API should be used
   */
  RecentTravisCIBuildsWidget,
} from './components/RecentTravisCIBuildsWidget';
