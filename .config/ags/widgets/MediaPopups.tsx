import { bind } from "astal";
import Player from "./Player";

import Mpris from "gi://AstalMpris";
import { App, Astal } from "astal/gtk3";
import { globalMargin } from "../variables";

const mpris = Mpris.get_default();
const players = bind(mpris, "players");

export default () => {
  return (
    <window
      name="media"
      namespace={"media"}
      application={App}
      anchor={Astal.WindowAnchor.TOP}
      margin={globalMargin}
      visible={false}
      child={
        <box
          className="media-popup"
          child={
            <eventbox
              onHoverLost={() => App.toggle_window("media")}
              child={
                <box vertical={true} spacing={10}>
                  {players.as((p) =>
                    p.map((player) => (
                      <Player player={player} playerType="popup" />
                    ))
                  )}
                </box>
              }></eventbox>
          }></box>
      }></window>
  );
};
