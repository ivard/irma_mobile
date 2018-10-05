import {RNMail} from 'NativeModules';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import moment from 'moment';

import {namespacedTranslation} from 'lib/i18n';

const t = namespacedTranslation('Mail');

function saveResult(result, filetype) {
    // TODO: unique name for saving?

  var date = new Date();
  var formattedDate = moment(date).format('YYYYMMDD-hhmm');

    const dest = ( Platform.OS === 'ios' ? RNFS.TemporaryDirectoryPath : RNFS.ExternalDirectoryPath+'/' ) + formattedDate + "." + filetype;
    return RNFS.writeFile(dest, result, 'utf8').then(() => dest);
  }

function sendMail(result, request, filetype) {
  saveResult(result, filetype)
    .then(path => {
      RNMail.mail({
        subject: t('.subject'),
        body: t('.body'),
        isHTML: false,
        recipients: [request.from],
        attachment: {
          path: path,
          type: 'json',
        },
      }, () => {
        // if (error == 'not_available') {
        //   TODO: show info that no mail apps are installed
        // }
      });
    });
}

export function sendSignatureMail(result, request) {
  sendMail(result, request, 'irmasignature');
}

export function sendBackupMail(result, request) {
  const json = {type: 'irmabackup', data: result};
  let jsonStr = JSON.stringify(json);
  console.log(jsonStr);

  sendMail(jsonStr, request, 'irmabackup');
}

// Checks whether there is a mailclient configured on the phone
export function canSendMail() {
  return new Promise((resolve,reject) => {
    RNMail.canSend((error, result) => {
      if (error || !result) {
        reject();
      } else {
        resolve();
      }
    });
  });
}
