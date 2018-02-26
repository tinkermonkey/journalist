import { moment } from 'meteor/momentjs:moment';

moment.updateLocale('en', {
  week: {
    dow: 1,
  },
});
moment.locale('en');