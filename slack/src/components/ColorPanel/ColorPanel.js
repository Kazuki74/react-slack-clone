import React from 'react';
import { Sidebar, Divider, Button, Menu, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import { connect } from 'react-redux';
import { setColors } from '../../actions';
import firebase from '../../firebase';

class ColorPanel extends React.Component {
    state = {
        modal: false,
        primary: '',
        secondary: '',
        usersRef: firebase.database().ref('users'),
        user: this.props.currentUser,
        userColors: []
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.uid}/colors`).off();
    }

    addListener = userId => {
        let userColors = [];
        this.state.usersRef.child(userId).child('colors')
            .on("child_added", snap => {
                userColors.unshift(snap.val());
                this.setState({ userColors });
            })
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    handleChangePrimary = color => this.setState({ primary: color.hex });

    handleChangeSecondary = color => this.setState({ secondary: color.hex });

    handleSaveColors = () => {
        if(this.state.primary && this.state.secondary) {
            this.saveColors(this.state.primary, this.state.secondary);
        }
    }

    saveColors = (primary, secondary) => {
        this.state.usersRef
            .child(this.state.user.uid)
            .child('colors')
            .push()
            .update({
                primary,
                secondary
            })
            .then(() => {
                console.log("colors added!")
                this.closeModal();
            })
            .catch((e) => {
                console.log(e);
            })
    }

    displayUserColors = colors => 
        colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div
                    className="color__container"
                    onClick={() => this.props.setColors(color.primary, color.secondary)}
                >
                    <div className="color__square" style={{ background: color.primary }}>
                        <div className="color__overlay" style={{ background: color.secondary }}></div>
                    </div>
                </div>
            </React.Fragment>
        ))

    render() {
        const { modal, primary, secondary, userColors } = this.state;
        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                {this.displayUserColors(userColors)}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Choose App Color
                    </Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary Color"/>
                            <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
                        </Segment>
                        <Segment inverted>
                            <Label content="Secondary Color"/>
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary}/>
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColors}>
                            <Icon name="checkmark"/> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}

const mapDispatchToProps = { setColors };

export default connect(null, mapDispatchToProps)(ColorPanel);