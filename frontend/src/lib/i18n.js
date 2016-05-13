import moment from './moment'
import strings from '../ui/strings.json';

module.exports = (lang) => {
  moment.locale(lang);
  return {
    getString: (strid) => {
      return strings[lang][strid] || strings['en'][strid];
    },
    moment
  };  
}