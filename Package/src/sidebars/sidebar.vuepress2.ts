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

export default (navigation: NavigationItem[], basePath: string) => {
  return navigation.map((navigationItem) => {
    return getNavigationItem(navigationItem, basePath);
  });
};

function getNavigationItem(navigationItem: NavigationItem, basePath: string) {
  return {
    text: navigationItem.title,
    link: navigationItem.path ? `/${basePath}/${navigationItem.path}` : null,
    collapsible: true,
    children: navigationItem?.children?.map((group) => {
      return getNavigationItem(group, basePath);
    }),
  };
}
