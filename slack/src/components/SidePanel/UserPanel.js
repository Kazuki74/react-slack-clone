import React from 'react';
import { Grid, Header, Icon, Dropdown } from 'semantic-ui-react';
import firebase from '../../firebase';
// import {connect} from 'react-redux';

class UserPanel extends React.Component {
    state = {
        user: this.props.currentUser
    }

    dropdownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>{ this.state.user.displayName }</strong></span>,
            disabled: true,
        },
        {
            key: "avatar",
            text: <span>Change Avatar</span>
        },
        {
            key: "signout",
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ]
    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("signed out!")
            })
    }
    render() {
        console.log(this.props)
        return(
            <Grid style={{ background: "#4c3c4c"}}>
                <Grid.Column>
                    {/* App Header */}
                    <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
                        <Header inverted floated="left" as="h2" >
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    </Grid.Row>
                    {/* User Dropdown */}
                    <Header style={{ padding: "0.25em" }} as="h4" inverted>
                        <Dropdown trigger={
                                <span>{ this.state.user.displayName }</span>
                            } options={this.dropdownOptions()}
                        />
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

// const mapStateToProps = state => ({
//     currentUser : state.user.currentUser
// })

// export default connect(mapStateToProps)(UserPanel);

export default UserPanel;