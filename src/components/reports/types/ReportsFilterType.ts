export type FilterType = {
  isFiltering: boolean;
  sendFilterToPage: any;
  onDialogClose: any;
  activeTab?: number;
};

export type EmailFilterType = {
  isFiltering: boolean;
  sendFilterToPage: any;
  onDialogClose: any;
  activeTab?: number;
  tagDropdown: { label: string; value: string }[];
};
