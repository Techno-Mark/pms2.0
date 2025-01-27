export type FilterType = {
  isFiltering: boolean;
  sendFilterToPage: any;
  onDialogClose: any;
  activeTab?: number;
  tagDropdown: { label: string; value: string }[];
};
