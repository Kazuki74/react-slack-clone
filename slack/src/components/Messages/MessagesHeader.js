import React from 'react';
import { Segment, Header, Icon, Input } from 'semantic-ui-react';

class MessagesHeader extends React.Component {
    render() {
        const { channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel } = this.props;
        console.log(isPrivateChannel)
        return (
            <Segment clearing>
                {/* Channel Info */}
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon name={"star outline"} color="black" />}
                    </span>
                    <Header.Subheader>
                        {numUniqueUsers}
                    </Header.Subheader>
                </Header>
                {/* Channel Search Input */}
                <Header floated="right">
                    <Input
                        onChange={handleSearchChange}
                        loading={searchLoading}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader;