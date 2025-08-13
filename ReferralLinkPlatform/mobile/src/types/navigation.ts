export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Dashboard: undefined;
  Links: undefined;
  Analytics: undefined;
  Profile: undefined;
  CreateLink: undefined;
  LinkDetails: {
    linkId: string;
    newLink?: boolean;
  };
  MyLinks: undefined;
  BulkShare: undefined;
  SendReferral: undefined;
  Contacts: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}