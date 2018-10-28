import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from './FileModal';
import firebase from '../../firebase';

class MessageForm extends React.Component {
    state = {
        message: '',
        channel: this.props.currentChannel,
        loading: false,
        user: this.props.currentUser,
        errors: [],
        modal: false
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    createMessage = () => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP ,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },
            content: this.state.message
        }
        return message;
    }

    sendMessage = () => {
        const { messagesRef } = this.props;
        const { message, channel } = this.state;
        if (message) {
            this.setState({ loading: true });
            messagesRef
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    console.log("added a message!");
                    this.setState({
                        loading: false,
                        message: '',
                        errors: []
                    })
                })
                .catch((err) => {
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    })
                })
        } else {
            console.log('error!');
            this.setState({
                errors: this.state.errors.concat({
                    message: "Add a message."
                })
            })
        }
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    render () {
        const { errors, message, loading, modal } = this.state;
        return (
            <Segment className="message__form">
                <Input 
                    fluid
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    style={{ marginBottom: '0.7em' }}
                    label={ <Button icon={"add"} />}
                    labelPosition="left"
                    className={
                        errors.some(error => error.message.includes('message')) ? "error" : ""
                    }
                    placeholder="Write your message"
                />
                <Button.Group iconwidth="2" >
                    <Button
                        color="orange"
                        disabled={loading}
                        onClick={this.sendMessage}
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button 
                        color="teal"
                        content="Upload Media"
                        onClick={this.openModal}
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>
                <FileModal 
                    modal={modal}
                    closeModal={this.closeModal}
                />
            </Segment>
        )
    }
}

export default MessageForm;