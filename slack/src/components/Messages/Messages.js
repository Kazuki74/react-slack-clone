import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessagesForm from './MessagesForm'
import MessagesHeader from './MessagesHeader';
import Message from './Message';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';

class Messages extends React.Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: 0,
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        isChannelStarred: false,
        usersRef: firebase.database().ref('users')
    }

    componentDidMount = () => {
        const { channel, user } = this.state;
        if ( channel && user ) {
            this.addListener(channel.id);
            this.addUserStarsListener(channel.id, user.uid);
        }
        console.log(this.state.messages);
    }

    addListener = channelId => {
        this.addMessageListener(channelId);
    }

    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({
                        isChannelStarred: prevStarred
                    })
                }
            })
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        })
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, [])
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural? 's' : ''}`;
        this.setState( {
            numUniqueUsers: numUniqueUsers
        } )
    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            }
            else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {})
        this.props.setUserPosts(userPosts);
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
    
    handleSearchChange = event => {
        this.setState(
            {
                searchTerm: event.target.value,
                searchLoading: true
            }, 
            () => this.handleSearchMessages()
        )
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, "gi");
        const searchResults = channelMessages.reduce((acc, message) => {
          if (
            (message.content && message.content.match(regex)) || message.user.name.match(regex)) {
            acc.push(message);
          }
          return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() =>{
            this.setState({
                searchLoading: false
            })
        }, 1000)
    };

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#' }${channel.name}` : '';
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state;
        return privateChannel ? privateMessagesRef : messagesRef
    }

    handleStar = () => {
        this.setState(
            prevState =>(
                { isChannelStarred: !prevState.isChannelStarred}
            ),() => {
            this.starredChannel();
        })
    }

    starredChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if(err !== null) {
                        console.log(err);
                    }
                })
        }
    }

    render() {
        const { messagesRef, channel, user, messages, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred } = this.state;
        console.log(messages);
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />
                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessagesForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

const mapDispatchToProps = {
    setUserPosts
}

export default connect(null, mapDispatchToProps)(Messages);