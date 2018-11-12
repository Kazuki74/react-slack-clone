import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuidv4 from 'uuid/v4';
import FileModal from './FileModal';
import firebase from '../../firebase';
import ProgressBar from './ProgressBar';
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

class MessageForm extends React.Component {
    state = {
        percentUploaded: 0,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref('typing'),
        message: '',
        channel: this.props.currentChannel,
        loading: false,
        user: this.props.currentUser,
        errors: [],
        modal: false,
        emojiPicker: false
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP ,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },
        }
        if (fileUrl !== null) {
            message['image'] = fileUrl;
        } else {
            message['content'] = this.state.message;
        }
        return message;
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel, user, typingRef } = this.state;
        if (message) {
            this.setState({ loading: true });
            getMessagesRef()
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
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove();
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

    getPath = () => {
        if(this.props.isPrivateChannel) {
            return `chat/private-${this.state.channel.id}`;
        } else {
            return `{chat/public}`;
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
        this.setState(
            {
                uploadState: 'uploading',
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            }, 
            () => {
                this.state.uploadTask.on(
                    'state_changed',
                    snap => {
                        const percentUploaded = Math.round(( snap.bytesTransferred / snap.totalBytes ) * 100);
                        this.setState({ percentUploaded });
                    },
                    err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: 'error',
                            uploadTask: null
                        })
                    },
                    () => {
                        this.state.uploadTask.snapshot.ref
                        .getDownloadURL()
                        .then(downloadUrl => {
                            this.sendFileMessage(downloadUrl, ref, pathToUpload);
                        })
                        .catch(err => {
                            console.error(err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: 'error',
                                uploadTask: null
                            })
                        })
                    }
                )
            }
        )
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: 'done'} );
            })
            .catch( err => {
                console.log(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                })
            })
    }

    handleKeyDown = () => {
        const { message, channel, typingRef, user } = this.state;
        if(message) {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove();
        }
    }

    handleTogglePicker = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker });
    }

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
        this.setState({
            message: newMessage,
            emojiPicker: false
        })
        setTimeout(() => this.messageInputRef.focus(), 0);
    }

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
      };

    render () {
        const { errors, message, loading, modal, percentUploaded, uploadState, emojiPicker  } = this.state;
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker 
                        set="apple"
                        className="emojiPicker"
                        title="Pick your emoji!"
                        emoji="point up"
                        onSelect={this.handleAddEmoji}
                    />
                )}
                <Input 
                    fluid
                    name="message"
                    value={message}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    style={{ marginBottom: '0.7em' }}
                    label={ 
                        <Button
                            icon={emojiPicker ? "close" : "add"}
                            content={emojiPicker ? "close" : null}
                            onClick={this.handleTogglePicker}
                        />
                    }
                    labelPosition="left"
                    className={
                        errors.some(error => error.message.includes('message')) ? "error" : ""
                    }
                    placeholder="Write your message"
                    ref={node => (this.messageInputRef = node)}
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
                        disabled={uploadState === 'uploading'}
                        onClick={this.openModal}
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>
                <FileModal 
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar 
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        )
    }
}

export default MessageForm;