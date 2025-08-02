import React, { Component } from "react";
import { Follow } from "react-twitter-widgets";
import { Config } from "../../models";

type UserInfoProps = {
  config: Config;
  expanded: boolean;
};

// eslint-disable-next-line react/prefer-stateless-function
class UserInfo extends Component<UserInfoProps, {}> {
  render() {
    const { config, expanded } = this.props;
    const { userTwitter } = config;
    return (
      // TODO: remove the react-twitter-widgets dependency
      // eslint-disable-next-line react/jsx-filename-extension
      <Follow
        username={userTwitter}
        options={{ count: expanded ? true : "none" }}
      />
    );
  }
}

export default UserInfo;
