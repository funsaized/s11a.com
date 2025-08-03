import React from "react";
import { Config } from "../../models";

interface UserInfoProps {
  config: Config;
  expanded?: boolean;
}

function UserInfo({ config, expanded }: UserInfoProps): React.ReactElement {
  return (
    <div className="user-info">
      <p>{config.userDescription}</p>
    </div>
  );
}

export default UserInfo;
