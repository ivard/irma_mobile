import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from 'lib/UnwrappedCard';
import { getLanguage } from 'lib/i18n';
import {
  CardItem,
  Left,
  ListItem,
  Text,
  Body,
  Right,
  Radio,
} from 'native-base';

import CredentialLogo from 'components/CredentialLogo';
import {Dimensions} from "react-native";
import Image from 'react-native-scalable-image';

const lang = getLanguage();

export default class DisclosureChoice extends Component {

  static propTypes = {
    candidates: PropTypes.array.isRequired,
    choice: PropTypes.object.isRequired,
    disclosure: PropTypes.object.isRequired,
    disclosureIndex: PropTypes.number.isRequired,
    hideUnchosen: PropTypes.bool,
    makeDisclosureChoice: PropTypes.func.isRequired,
  }

  renderCandidate(candidate) {
    const {
      choice,
      disclosureIndex,
      hideUnchosen,
      makeDisclosureChoice,
    } = this.props;

    const press = () => makeDisclosureChoice(disclosureIndex, candidate.Type, candidate.CredentialHash);
    //const isSelected = choice.Type === candidate.Type && choice.CredentialHash === candidate.CredentialHash;
    const isSelected = choice.CredentialHash === candidate.CredentialHash;
    // Don't know what choice.Type did at first, but now it doesn't do that anymore

    if(hideUnchosen && !isSelected)
      return null;

    var value;
    switch(candidate.Type) {
      case 'image':
        var image = 'data:image/jpeg;base64,' + candidate.Value[lang]; // For now only jpeg support
        value = <Image
          width={Dimensions.get('window').width * 0.4}
          source={{uri: image}}
        />;
        break;
      default:
        value = <Text style={{fontWeight: 'normal'}}>
          { candidate.Value[lang] }
        </Text>;
        break;
    }

    return (
      <ListItem
        key={`${candidate.Type}-${candidate.CredentialHash}`}
        onPress={press}
      >
        <Left>
          <CredentialLogo credentialType={candidate.CredentialType} />
          <Body>
            {value}
            <Text note>
              { candidate.Name[lang] === 'Foto' ? null : candidate.Name[lang] }
            </Text>
          </Body>
        </Left>
        {hideUnchosen ? null :
          <Right>
            <Radio selected={isSelected}/>
          </Right>
        }
      </ListItem>
    );
  }

  render() {
    const {
      candidates,
      disclosure,
    } = this.props;

    return (
      <Card>
        <CardItem>
          <Text style={{fontWeight: 'bold'}}>{ disclosure.label }:</Text>
        </CardItem>
        { candidates.map(::this.renderCandidate) }
      </Card>
    );
  }
}
