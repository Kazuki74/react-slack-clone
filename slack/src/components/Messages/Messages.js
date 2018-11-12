import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import MessagesForm from './MessagesForm'
import MessagesHeader from './MessagesHeader';
import Message from './Message';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import Typing from './Typing';
import Skeleton from './Skeleton';

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
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref(".info/connected")
    }

    componentDidMount() {
        const { channel, user } = this.state;
        if ( channel && user ) {
            this.addListener(channel.id);
            this.addUserStarsListener(channel.id, user.uid);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.messagesEnd) {
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth"});
    }

    addListener = channelId => {
        this.addMessageListener(channelId);
        this.addTypingListener(channelId);
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

    addTypingListener = channelId => {
        let typingUsers = [];
        this.state.typingRef
            .child(channelId)
            .on("child_added", snap => {
                if (snap.key !== this.state.user.uid) {
                    typingUsers = typingUsers.concat({
                        id: snap.key,
                        name: snap.val()
                    })
                }
                this.setState({ typingUsers });
            })
        this.state.typingRef
            .child(channelId)
            .on("child_removed", snap => {
                const index = typingUsers.findIndex(user => user.id === snap.key);
                if (index !== -1) {
                    typingUsers = typingUsers.filter(user => user.id !== snap.key);
                    this.setState({ typingUsers });
                }
            })
        this.state.connectedRef.on('value', snap => {
            if(snap.val() === true) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if(err !== null) {
                            console.error(err);
                        }
                    })
            }
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

    displayTypingUsers = (users) => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                 <span className="user__typing">{user.name} is typing</span><Typing />
            </div>
        ))
    )

    displayMessageSkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) =>
                    <Skeleton key={i}/>
                )}
            </React.Fragment>
        ) : null
    )

    render() {
        const { 
            messagesRef,
            channel,
            user,
            messages,
            numUniqueUsers,
            searchTerm,
            searchResults,
            searchLoading,
            privateChannel,
            isChannelStarred,
            typingUsers,
            messagesLoading
        } = this.state;
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
                        {this.displayMessageSkeleton(messagesLoading)}
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => (this.messagesEnd = node)}></div>
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