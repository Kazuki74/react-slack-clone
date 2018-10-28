import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessagesForm from './MessagesForm'
import MessagesHeader from './MessagesHeader';

class Messages extends React.Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser
    }
    render() {
        const { messagesRef, channel, user } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                        {/* Messages */}
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