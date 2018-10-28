import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessagesForm from './MessagesForm'
import MessagesHeader from './MessagesHeader';
import Message from './Message';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true
    }

    componentDidMount = () => {
        const { channel, user } = this.state;
        if ( channel && user ) {
            this.addListener(channel.id)
        }
    }

    addListener = channelId => {
        this.addMessageListener(channelId);
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
        })
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message 
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    )

    render() {
        const { messagesRef, channel, user, messages } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessagesForm 
                    messagesRef={ messagesRef }
                    currentChannel={ channel }
                    currentUser={ user }
                />
            </React.Fragment>
        )
    }
}

export default Messages;