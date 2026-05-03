import { Sidebar } from '../types/index.js';
import sidebarVitepress from './sidebar.vitepress.js';
import sidebarVuepress1 from './sidebar.vuepress1.js';
import sidebarVuepress2 from './sidebar.vuepress2.js';
/**
 * The model used to define each navigation item.
 */
export interface NavigationItem {
  /**
   * The title of the navigation item.
   */
  title: string;
  /**
   * The path to the associated generated markdown file.
   */
  path?: string | null;
  /**
   * The kind of the reflection.
   */
  kind?: any;
  /**
   * Flag indicating whether the item is deprecated.
   */
  isDeprecated?: boolean;
  /**
   * Child navigation items if applicable.
   */
  children?: NavigationItem[];
}

export function getSidebar(
  navigation: NavigationItem[],
  basePath: string,
  options: Sidebar,
) {
  if (options.format === 'vuepress1') {
    return sidebarVuepress1(navigation, basePath);
  }
  if (options.format === 'vuepress2') {
    return sidebarVuepress2(navigation, basePath);
  }
  return sidebarVitepress(navigation, basePath, options);
}
