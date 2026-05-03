import * as path from 'path';
import { Sidebar } from '../types/index.js';

/**
 * The model used to define each navigation item.
 */
interface NavigationItem {
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

export default (
  navigation: NavigationItem[],
  basePath: string,
  options: Sidebar,
) => {
  return navigation.map((navigationItem) => {
    return getNavigationItem(navigationItem, basePath, options);
  });
};

function getNavigationItem(
  navigationItem: NavigationItem,
  basePath: string,
  options: any,
) {
  const hasChildren = navigationItem?.children?.length;

  const linkParts: string[] = [];

  if (navigationItem?.path) {
    if (basePath.length) {
      linkParts.push(basePath);
    }
    linkParts.push(
      getParsedUrl(navigationItem.path as string).replace(/\\/g, '/'),
    );
  }

  return {
    text: navigationItem.title,
    ...(linkParts.length && {
      link: `/${linkParts.join('/')}`,
    }),
    ...(hasChildren && { collapsed: options.collapsed }),
    ...(hasChildren && {
      items: navigationItem.children?.map((group) =>
        getNavigationItem(group, basePath, options),
      ),
    }),
  };
}

function getParsedUrl(url: string) {
  if (path.basename(url) === 'index.md') {
    return path.dirname(url) + '/';
  }
  return url;
}
