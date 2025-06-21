declare module 'react-native-grid-component' {
  import { ComponentType } from 'react';
    import { FlatListProps } from 'react-native';

  export interface GridProps<ItemT> extends FlatListProps<ItemT> {
    renderItem: (item: ItemT, index: number) => React.ReactNode;
    itemsPerRow?: number;
    itemHasChanged?: (prevItem: ItemT, nextItem: ItemT) => boolean;
  }

  export const Grid: ComponentType<GridProps<any>>;
}