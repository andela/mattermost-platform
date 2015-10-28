// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

const PostList = require('./post_list.jsx');
const TutorialIntroScreens = require('./tutorial/tutorial_intro_screens.jsx');
const UserStore = require('../stores/user_store.jsx');
const ChannelStore = require('../stores/channel_store.jsx');
const PreferenceStore = require('../stores/preference_store.jsx');

const Constants = require('../utils/constants.jsx');
const Preferences = Constants.Preferences;

export default class PostListContainer extends React.Component {
    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.onPreferenceChange = this.onPreferenceChange.bind(this);

        const currentChannelId = ChannelStore.getCurrentId();
        let state = {};
        if (currentChannelId) {
            state = {currentChannelId, postLists: [currentChannelId]};
        } else {
            state = {currentChannelId: null, postLists: []};
        }

        const isTutorialComplete = PreferenceStore.getPreference(Preferences.TUTORIAL_INTRO_COMPLETE, UserStore.getCurrentId(), 'false');
        state.isTutorialComplete = isTutorialComplete.value === 'true';

        this.state = state;
    }
    componentDidMount() {
        ChannelStore.addChangeListener(this.onChange);
        ChannelStore.addLeaveListener(this.onLeave);
        PreferenceStore.addChangeListener(this.onPreferenceChange);
    }
    componentWillUnmount() {
        ChannelStore.removeChangeListener(this.onChange);
        ChannelStore.removeLeaveListener(this.onLeave);
        PreferenceStore.removeChangeListener(this.onPreferenceChange);
    }
    onChange() {
        const currentChannelId = ChannelStore.getCurrentId();
        if (currentChannelId === this.state.currentChannelId) {
            return;
        }

        const postLists = this.state.postLists;
        if (postLists.indexOf(currentChannelId) === -1) {
            postLists.push(currentChannelId);
        }
        this.setState({currentChannelId, postLists});
    }
    onLeave(id) {
        const postLists = this.state.postLists;
        const index = postLists.indexOf(id);
        if (index !== -1) {
            postLists.splice(index, 1);
        }
    }
    onPreferenceChange() {
        const isTutorialComplete = PreferenceStore.getPreference(Preferences.TUTORIAL_INTRO_COMPLETE, UserStore.getCurrentId(), 'false');
        this.setState({isTutorialComplete: isTutorialComplete.value === 'true'});
    }
    render() {
        const postLists = this.state.postLists;
        const channelId = this.state.currentChannelId;

        const postListCtls = [];
        let tutorialIntro = null;

        if (this.state.isTutorialComplete) {
            for (let i = 0; i <= this.state.postLists.length - 1; i++) {
                postListCtls.push(
                    <PostList
                        key={'postlistkey' + i}
                        channelId={postLists[i]}
                        isActive={postLists[i] === channelId}
                    />
                );
            }
        } else {
            tutorialIntro = <TutorialIntroScreens/>;
        }

        return (
            <div>
                {postListCtls}
                {tutorialIntro}
            </div>
        );
    }
}
