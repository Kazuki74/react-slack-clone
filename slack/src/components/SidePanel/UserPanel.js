import React from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
// import {connect} from 'react-redux';

class UserPanel extends React.Component {
    state = {
        user: this.props.currentUser,
        modal: false,
    }

    dropdownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>{ this.state.user.displayName }</strong></span>,
            disabled: true,
        },
        {
            key: "avatar",
            text: <span onClick={this.openModal}>Change Avatar</span>
        },
        {
            key: "signout",
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ]

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log("signed out!")
            })
    }
    render() {
        const { user, modal } = this.state;
        const { primaryColor } = this.props;
        return(
            <Grid style={{ background: primaryColor}}>
                <Grid.Column>
                    {/* App Header */}
                    <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
                        <Header inverted floated="left" as="h2" >
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                        {/* User Dropdown */}
                        <Header style={{ padding: "0.25em" }} as="h4" inverted>
                            <Dropdown trigger={
                                    <span>
                                        <Image src={user.photoURL} spaced="right" avatar />
                                        { user.displayName }
                                    </span>
                                } options={this.dropdownOptions()}
                            />
                        </Header>
                    </Grid.Row>
                    {/* Change User Avatar Modal */}
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input 
                                fluid
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {/* Image Preview */}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {/* Cropped Image Preview */}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted>
                                <Icon name="save"/> Change Avatar
                            </Button>
                            <Button color="green" inverted>
                                <Icon name="image"/> Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove"/> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
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