import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesForm from './MessagesForm'
import MessagesHeader from './MessagesHeader';

class Messages extends React.Component {
    render() {
        return (
            <React.Fragment>
                <MessagesHeader />
                <Segment>
                    <Comment.Group className="messages">
                        {/* Messages */}
                    </Comment.Group>
                </Segment>

                <MessagesForm />
            </React.Fragment>
        )
    }
}

export default Messages;